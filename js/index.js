import * as d3 from 'd3';

const url = 'https://raw.githubusercontent.com/fivethirtyeight/data/master/bob-ross/elements-by-episode.csv';

const earth = ['earth', '#73795D'];
const flora = ['flora', '#64A175'];
const manmade = ['manmade', '#989D96'];
const sky = ['sky', '#A9DEE6'];
const water = ['water', '#47799A'];

const frame = ['frame', '#665545'];
const other = ['other', '#B8C6C6'];

const types = [frame, sky, manmade, earth, manmade, manmade, manmade, flora, manmade, flora, frame, sky, earth, sky, flora, sky, flora, other, manmade, frame, manmade, manmade, other, frame, flora, water, frame, flora, other, frame, frame, earth, water, water, manmade, manmade, sky, earth, earth, sky, water, frame, flora, other, other, other, frame, frame, water, earth, frame, water, earth, frame, other, manmade, sky, frame, flora, flora, frame, water, water, manmade, frame, other, frame];

const width = window.innerWidth;
const height = window.innerHeight;
const mapOffset = 3;
const focusOffset = 30;

const parse = json => {
    return json.reduce((shows, show, index) => {
        shows.push(Object.keys(show).reduce((datum, key) => {
            // elevate EPISODE and TITLE out of FEATURES
            ['EPISODE', 'TITLE'].includes(key) ?
                datum[key] = show[key] :
                datum.FEATURES[key] = parseInt(show[key], 10);
            datum.NUMBER = index;
            return datum;
        }, { NUMBER: index, FEATURES: {} }));
        return shows;
    }, []);
};

const colorByType = (...args) => types[args[1]][1];

const makeScales = (data, series) => {
    const maxY = d3.max(series, layer => d3.max(layer, d => d[0] + d[1]));
    return {
        mapX: d3.scaleLinear().domain([0, data.length]).range([0, width]),
        focusX: d3.scaleLinear().domain([0, data.length]).range([0, width]),
        mapY: d3.scaleLinear().domain([0, maxY]).range([0, height / 4]),
        focusY: d3.scaleLinear().domain([0, maxY]).range([0, height * 1.25])
    };
};

const renderPaths = (node, series, area) => {
    return node.selectAll('path')
        .data(series)
        .enter().append('path')
        .attr('d', area)
        .style('fill', colorByType)
        .style('stroke', colorByType);
};

const svg = d3.select('body')
    .insert('svg:svg', ':first-child');

const map = svg.append('g')
    .attr('class', 'map')
    .style('transform', `translate(0, ${mapOffset}vh)`);

const focus = svg.append('g')
    .attr('class', 'focus')
    .style('transform', `translate(0, ${focusOffset}vh)`);

const zoomRect = svg.append('rect')
    .attr('class', 'zoom')
    .style('transform', `translate(0, ${focusOffset}vh)`);

const generate = json => {
    const data = parse(json);

    const stack = d3.stack()
        .keys(Object.keys(data[0].FEATURES))
        .offset(d3.stackOffsetWiggle)
        .value((d, key) => d.FEATURES[key]);
    const series = stack(data);

    const { mapX, focusX, mapY, focusY } = makeScales(data, series);

    const mapArea = d3.area()
        .curve(d3.curveBasis)
        .x(d => mapX(d.data.NUMBER))
        .y0(d => mapY(d[0]))
        .y1(d => mapY(d[1]));
    renderPaths(map, series, mapArea);

    const brushed = () => {
        // ignore brush-by-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
        const scale = d3.event.selection || mapX.range();
        focusX.domain(scale.map(mapX.invert, mapX));
        focus.selectAll('path').attr('d', focusArea);
        svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
            .scale(width / (scale[1] - scale[0]))
            .translate(-scale[0], 0));
    };

    const mapBox = map.node().getBBox();
    const brush = d3.brushX()
        .extent([[mapBox.x, mapBox.y], [mapBox.width, mapBox.y + mapBox.height]])
        .on('brush', brushed);

    map.append('g')
        .attr('class', 'brush')
        .call(brush);

    const focusArea = d3.area()
        .curve(d3.curveBasis)
        .x(d => focusX(d.data.NUMBER))
        .y0(d => focusY(d[0]))
        .y1(d => focusY(d[1]));

    renderPaths(focus, series, focusArea)
        .on('mouseover', (...args) => args[2][args[1]].setAttribute('opacity', 0.5))
        .on('mouseout', (...args) => args[2][args[1]].setAttribute('opacity', 1));

    const zoomed = () => {
        // ignore zoom-by-brush
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        const transform = d3.event.transform;
        focusX.domain(transform.rescaleX(mapX).domain());
        focus.selectAll('path').attr('d', focusArea);
        map.select('.brush').call(brush.move, mapX.range().map(transform.invertX, transform));
    };
    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    const focusBox = focus.node().getBBox();
    zoomRect
        .attr('x', focusBox.x)
        .attr('y', focusBox.y)
        .attr('width', focusBox.width)
        .attr('height', focusBox.height)
        .call(zoom);
};

d3.csv(url).response(xhr => d3.csvParse(xhr.responseText)).get(generate);
