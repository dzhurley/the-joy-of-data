import '../scss/style';

import * as d3 from 'd3';

import { canvasWidth, height, types, url, yRange } from './constants';
import { stream } from './elements';
import { hoverable, zoomable } from './behaviors';

let activeColors = [];
const updatePaths = (element, context, series, area) => {
    context.clearRect(0, 0, element.width, element.height);
    context.globalAlpha = 1;
    if (activeColors.length) {
        series.forEach(datum => {
            context.fillStyle = types[datum.index];
            // TODO: fold into data so conditional is avoided
            context.globalAlpha = activeColors.includes(context.fillStyle) ? 1 : 0.2;
            context.fill(new Path2D(area(datum)));
        });
    } else {
        series.forEach(datum => {
            context.fillStyle = types[datum.index];
            context.fill(new Path2D(area(datum)));
        });
    }
};

const capitalize = (text, delimiter) => {
    const words = text.replace(/"/g, '').toLowerCase().split(delimiter);
    return words.map(word => word[0].toUpperCase() + word.slice(1, word.length)).join(' ');
};

d3.csv(url)
    .response(xhr => d3.csvParse(xhr.responseText))
    .get(json => {
        const data = json.map((show, showIndex) => {
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

        const maxY = d3.max(series, layer => d3.max(layer, d => d[0] + d[1]));
        const x = d3.scaleLinear().domain([0, data.length]).range([0, canvasWidth]);
        const y = d3.scaleLinear().domain([0, maxY]).range(yRange);

        const axis = d3.axisTop(x);
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

        const element = stream.node();
        element.width = canvasWidth * 2;
        element.style.width = canvasWidth + 'px';
        element.height = height * 2;
        element.style.height = height + 'px';
        const context = element.getContext('2d');
        context.scale(2, 2);

        const update = () => updatePaths(element, context, series, area);
        update();

        hoverable(data, axis, colors => {
            activeColors = colors;
            update();
        });
        zoomable(x, x.copy(), update);
    });
