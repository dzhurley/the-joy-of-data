import * as d3 from 'd3';

import { focusHeight, focusOffset, mapHeight, mapOffset, types, width } from './constants';
import { focus, map } from './elements';
import { brushMap, zoomFocus } from './behaviors';

const makeScales = (data, series) => {
    const maxY = d3.max(series, layer => d3.max(layer, d => d[0] + d[1]));
    return {
        mapX: d3.scaleLinear().domain([0, data.length]).range([0, width]),
        focusX: d3.scaleLinear().domain([0, data.length]).range([0, width]),
        mapY: d3.scaleLinear().domain([0, maxY]).range([mapOffset, mapHeight]),
        focusY: d3.scaleLinear().domain([0, maxY]).range([focusOffset, focusHeight])
    };
};

const makeArea = (x, y) => d3.area()
    .curve(d3.curveBasis)
    .x(d => x(d.data.NUMBER))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

const updatePaths = (node, series, area) => {
    const element = node.node();
    const context = element.getContext('2d');
    context.clearRect(0, 0, element.width, element.height);

    series.map(datum => {
        context.fillStyle = types[datum.index][1];
        context.strokeStyle = types[datum.index][1];
        const path = new Path2D(area(datum));
        context.stroke(path);
        context.fill(path);
    });
};

const setupCanvas = (node, height, offset) => {
    const element = node.node();
    element.width = width * 2;
    element.style.width = width + 'px';
    element.height = height + offset;
    element.style.height = height / 2 + offset + 'px';
    const context = element.getContext('2d');
    context.scale(2, 2);
};

d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bob-ross/elements-by-episode.csv')
    .response(xhr => d3.csvParse(xhr.responseText))
    .get(json => {
        const data = json.map((show, index) => {
            return Object.keys(show).reduce((datum, key) => {
                // elevate EPISODE and TITLE out of FEATURES
                ['EPISODE', 'TITLE'].includes(key) ?
                    datum[key] = show[key] :
                    datum.FEATURES[key] = parseInt(show[key], 10);
                datum.NUMBER = index;
                return datum;
            }, { NUMBER: index, FEATURES: {} });
        }, []);

        const stack = d3.stack()
            .keys(Object.keys(data[0].FEATURES))
            .offset(d3.stackOffsetWiggle)
            .value((d, key) => d.FEATURES[key]);
        const series = stack(data);

        const scales = makeScales(data, series);
        const mapArea = makeArea(scales.mapX, scales.mapY);
        const focusArea = makeArea(scales.focusX, scales.focusY);

        const updateFocus = () => updatePaths(focus, series, focusArea);

        setupCanvas(map, mapHeight, mapOffset);
        updatePaths(map, series, mapArea);
        brushMap(scales, updateFocus);

        setupCanvas(focus, focusHeight, focusOffset);
        updateFocus();
        zoomFocus(scales, updateFocus);
    });
