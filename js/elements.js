import { select } from 'd3';

import { focusOffset, mapOffset } from './constants';

export const svg = select('body')
    .append('svg:svg');

export const map = select('body')
    .append('canvas')
    .attr('class', 'map')
    .style('transform', `translate(0, ${mapOffset}vh)`)
    .node().getContext('2d');

export const focus = select('body')
    .append('canvas')
    .attr('class', 'focus')
    .style('transform', `translate(0, ${focusOffset}vh)`)
    .node().getContext('2d');

export const zoomExtent = svg.append('rect')
    .attr('class', 'zoom')
    .style('transform', `translate(0, ${focusOffset}vh)`);
