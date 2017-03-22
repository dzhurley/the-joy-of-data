import '../scss/style';

import * as d3 from 'd3';

import { height, streamWidth, types, url } from './constants';
import { focus, map } from './elements';
import { brushable, hoverable, zoomable } from './behaviors';

const capitalize = (text, delimiter) => {
    const words = text.replace(/"/g, '').toLowerCase().split(delimiter);
    return words.map(word => word[0].toUpperCase() + word.slice(1, word.length)).join(' ');
};

const parseData = json => json.map((show, showIndex) => {
    const match = /S(\d\d)E(\d\d)/.exec(show.EPISODE);
    const datum = {
        TITLE: capitalize(show.TITLE, ' '),
        EPISODE: `Season ${parseInt(match[1], 10)}, Episode ${parseInt(match[2], 10)}`,
        FEATURES: [],
        NUMBER: showIndex
    };
    delete show.EPISODE;
    delete show.TITLE;
    return Object.keys(show).reduce((datum, key, featureIndex) => {
        // [name, color, present, active]
        datum.FEATURES.push([
            capitalize(key, '_'),
            types[featureIndex],
            parseInt(show[key], 10),
            0
        ]);
        return datum;
    }, datum);
});

const makeScales = (data, series) => {
    const x = d3.scaleLinear().domain([0, data.length]).range([0, streamWidth]);
    const maxY = d3.max(series, layer => d3.max(layer, d => d[0] + d[1]));
    return {
        focusX: x,
        focusY: d3.scaleLinear().domain([0, maxY]).range([240, height * 1.75]),
        mapX: x.copy(),
        mapY: d3.scaleLinear().domain([0, maxY]).range([20, height / 4])
    };
};

const renderStream = (x, y, node, series) => {
    const area = d3.area()
        .curve(d3.curveBasis)
        .x0(d => x(d.data.NUMBER))
        .x1((d, i, n) => {
            // bail if not last episode
            if (i !== n.length - 1) return x(d.data.NUMBER);
            // extend only if feature exists
            return d.data.FEATURES[n.index][2] === 1 ?
                x(d.data.NUMBER + 1) :
                x(d.data.NUMBER);
        })
        .y0(d => y(d[0]))
        .y1(d => y(d[1]));

    node.selectAll('path')
        .data(series)
      .enter().append('path')
        .attr('d', area)
        .attr('fill', d => types[d.index]);

};

d3.csv(url)
    .response(xhr => d3.csvParse(xhr.responseText))
    .get(json => {
        const data = parseData(json);

        const stack = d3.stack()
            .keys(data[0].FEATURES.map(f => f[0]))
            .offset(d3.stackOffsetWiggle)
            .value((d, key) => d.FEATURES.some(f => f[0] === key && f[2] === 1));
        const series = stack(data);

        const { focusX, focusY, mapX, mapY } = makeScales(data, series);
        const focusAxis = d3.axisTop(focusX);

        renderStream(focusX, focusY, focus, series);
        renderStream(mapX, mapY, map, series);

        const update = index => focus.selectAll('path')
            .style('opacity', (d, i) => index ?
                // if box is clicked on focus, only dim the paths that aren't active
                (d[index].data.FEATURES[i][3] === 1 ? 1 : 0.2) :
                1
            );

        hoverable(data, focusAxis, update);
        zoomable(focusX, mapX);
        brushable(focusX, mapX);
    });
