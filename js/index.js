import * as d3 from 'd3';

import { focusHeight, focusOffset, mapHeight, mapOffset, types, width } from './constants';
import { focus, map, mapBottom } from './elements';
import { brushMap, zoomFocus } from './behaviors';
import { makeHovers } from './hover';

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

const updatePaths = (element, context, series, area) => {
    context.clearRect(0, 0, element.width, element.height);
    series.forEach(datum => {
        context.fillStyle = types[datum.index];
        context.fill(new Path2D(area(datum)));
    });
};

const setupCanvas = (node, height, offset) => {
    const el = node.node();
    el.width = width * 2;
    el.style.width = width + 'px';
    el.height = height + offset;
    el.style.height = height / 2 + offset + 'px';

    const ctx = el.getContext('2d');
    ctx.scale(2, 2);

    return { el, ctx };
};

d3.csv('https://raw.githubusercontent.com/fivethirtyeight/data/master/bob-ross/elements-by-episode.csv')
    .response(xhr => d3.csvParse(xhr.responseText))
    .get(json => {
        const data = json.map((show, showIndex) => {
            const titleWords = show.TITLE.replace(/"/g, '').toLowerCase().split(' ');
            const TITLE = titleWords.map(word => {
                return word[0].toUpperCase() + word.slice(1, word.length);
            }).join(' ');

            const [_, s, e] = /S(\d\d)E(\d\d)/.exec(show.EPISODE);
            const datum = {
                TITLE,
                EPISODE: `Season ${parseInt(s, 10)}, Episode ${parseInt(e, 10)}`,
                FEATURES: {},
                NUMBER: showIndex
            };
            delete show.EPISODE;
            delete show.TITLE;

            return Object.keys(show).reduce((datum, key, featureIndex) => {
                datum.FEATURES[key] = {
                    color: types[featureIndex],
                    present: parseInt(show[key], 10)
                };
                return datum;
            }, datum);
        }, []);

        const stack = d3.stack()
            .keys(Object.keys(data[0].FEATURES))
            .offset(d3.stackOffsetWiggle)
            .value((d, key) => d.FEATURES[key].present);
        const series = stack(data);

        const scales = makeScales(data, series);
        const mapAxis = d3.axisBottom(scales.mapX);
        const focusAxis = d3.axisTop(scales.focusX);
        const mapArea = makeArea(scales.mapX, scales.mapY);
        const focusArea = makeArea(scales.focusX, scales.focusY);

        const mapCanvas = setupCanvas(map, mapHeight, mapOffset);
        updatePaths(mapCanvas.el, mapCanvas.ctx, series, mapArea);
        mapBottom.call(mapAxis);

        const focusCanvas = setupCanvas(focus, focusHeight, focusOffset);
        const updateFocus = () => updatePaths(focusCanvas.el, focusCanvas.ctx, series, focusArea);
        updateFocus();

        makeHovers(data, focusAxis);

        zoomFocus(scales, updateFocus);
        brushMap(scales, updateFocus);
    });
