import { select } from 'd3';

import { height, width } from './constants';

export const svg = select('body')
    .insert('svg:svg', ':first-child')
    .attr('width', width)
    .attr('height', height);

export const map = svg.append('g')
    .attr('class', 'map');

export const brushExtent = svg.append('g')
    .attr('class', 'brush');

export const focus = svg.append('g')
    .attr('class', 'focus');

export const zoomExtent = svg.append('g')
    .attr('class', 'zoom');
