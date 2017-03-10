import { select } from 'd3';

export const map = select('body')
    .append('canvas')
    .attr('class', 'map');

export const focus = select('body')
    .append('canvas')
    .attr('class', 'focus');

export const svg = select('body')
    .append('svg:svg');

export const mapBottom = svg.append('g')
    .attr('class', 'map-axis');

export const focusBottom = svg.append('g')
    .attr('class', 'focus-axis');

export const brushExtent = svg.append('g')
    .attr('class', 'brush');

export const zoomExtent = svg.append('rect')
    .attr('class', 'zoom');
