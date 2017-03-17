import { select } from 'd3';

export const focus = select('body')
    .append('canvas')
    .attr('class', 'focus');

export const svg = select('body')
    .append('svg:svg');

export const zoomExtent = svg.append('g')
    .attr('class', 'zoom');
