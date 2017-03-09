import { select } from 'd3';

export const svg = select('body')
    .append('svg:svg');

export const map = select('body')
    .append('canvas')
    .attr('class', 'map');

export const focus = select('body')
    .append('canvas')
    .attr('class', 'focus');

export const zoomExtent = svg.append('rect')
    .attr('class', 'zoom');
