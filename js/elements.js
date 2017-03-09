import { select } from 'd3';

import { focusOffset, mapOffset } from './constants';

export const svg = select('body')
    .insert('svg:svg', ':first-child');

export const map = svg.append('g')
    .attr('class', 'map')
    .style('transform', `translate(0, ${mapOffset}vh)`);

export const focus = svg.append('g')
    .attr('class', 'focus')
    .style('transform', `translate(0, ${focusOffset}vh)`);

export const zoomExtent = svg.append('rect')
    .attr('class', 'zoom')
    .style('transform', `translate(0, ${focusOffset}vh)`);
