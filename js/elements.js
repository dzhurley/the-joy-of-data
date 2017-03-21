import { select } from 'd3';

import { height, width } from './constants';

export const svg = select('body')
    .insert('svg:svg', ':first-child')
    .attr('width', width)
    .attr('height', height);

export const stream = svg.append('g')
    .attr('class', 'stream');

export const zoomExtent = svg.append('g')
    .attr('class', 'zoom');
