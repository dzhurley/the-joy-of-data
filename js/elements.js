import { select } from 'd3';

export const map = select('body')
    .append('canvas')
    .attr('class', 'map');

export const focus = select('body')
    .append('canvas')
    .attr('class', 'focus');

export const svg = select('body')
    .append('svg:svg');

export const brushExtent = svg.append('g')
    .attr('class', 'brush');

export const zoomExtent = svg.append('g')
    .attr('class', 'zoom');
