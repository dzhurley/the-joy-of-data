import * as d3 from 'd3';

import { focusHeight, focusOffset, mapHeight, mapOffset, types, width } from './constants';
import { focus, map } from './elements';
import { brushMap, zoomFocus } from './behaviors';
import { makeHovers } from './hover';

const makeScales = (data, series) => {
    const maxY = d3.max(series, layer => d3.max(layer, d => d[0] + d[1]));
    return {
        mapX: d3.scaleLinear().domain([0, data.length]).range([0, width - 240]),
        focusX: d3.scaleLinear().domain([0, data.length]).range([0, width - 240]),
        mapY: d3.scaleLinear().domain([0, maxY]).range([mapOffset, mapHeight]),
        focusY: d3.scaleLinear().domain([0, maxY]).range([focusOffset, focusHeight])
    };
};

const makeArea = (x, y) => d3.area()
    .curve(d3.curveBasis)
    .x(d => x(d.data.NUMBER))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]));

const updatePaths = (element, context, series, area) => {
    context.clearRect(0, 0, element.width, element.height);
    series.forEach(datum => {
        context.fillStyle = types[datum.index];
        context.fill(new Path2D(area(datum)));
    });
};

const setupCanvas = (node, height, offset) => {
    const el = node.node();
    el.width = (width - 240) * 2;
    el.style.width = width - 240 + 'px';
    el.height = height + offset;
    el.style.height = height / 2 + offset + 'px';

    const ctx = el.getContext('2d');
    ctx.scale(2, 2);

    return { el, ctx };
};

const capitalize = (text, delimiter) => {
    const words = text.replace(/"/g, '').toLowerCase().split(delimiter);
    return words.map(word => word[0].toUpperCase() + word.slice(1, word.length)).join(' ');
};

d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bob-ross/elements-by-episode.csv')
    .response(xhr => d3.csvParse(xhr.responseText))
    .get(json => {
        const data = json.map((show, showIndex) => {
            const match = /S(\d\d)E(\d\d)/.exec(show.EPISODE);
            const datum = {
                TITLE: capitalize(show.TITLE, ' '),
                SEASON: parseInt(match[1], 10),
                EPISODE: parseInt(match[2], 10),
                FEATURES: [],
                NUMBER: showIndex
            };
            delete show.EPISODE;
            delete show.TITLE;
            return Object.keys(show).reduce((datum, key, featureIndex) => {
                datum.FEATURES.push([
                    capitalize(key, '_'),
                    types[featureIndex],
                    parseInt(show[key], 10)
                ]);
                return datum;
            }, datum);
        });

        const stack = d3.stack()
            .keys(data[0].FEATURES.map(f => f[0]))
            .offset(d3.stackOffsetWiggle)
            .value((d, key) => d.FEATURES.some(f => f[0] === key && f[2] === 1));
        const series = stack(data);

        const scales = makeScales(data, series);
        const focusAxis = d3.axisTop(scales.focusX);
        const mapArea = makeArea(scales.mapX, scales.mapY);
        const focusArea = makeArea(scales.focusX, scales.focusY);

        const mapCanvas = setupCanvas(map, mapHeight, mapOffset);
        updatePaths(mapCanvas.el, mapCanvas.ctx, series, mapArea);

        const focusCanvas = setupCanvas(focus, focusHeight, focusOffset);
        const updateFocus = () => updatePaths(focusCanvas.el, focusCanvas.ctx, series, focusArea);
        updateFocus();

        makeHovers(data, focusAxis);

        zoomFocus(scales, updateFocus);
        brushMap(scales, updateFocus);
    });
