import * as d3 from 'd3';

import { focusOffset } from './constants';
import { focus, zoomExtent } from './elements';

let axis;

const hover = (_, index, elements) => {
    console.log(d3.mouse(focus.node()));
    elements[index].style.stroke = 'grey';
    elements[index].style.opacity = 0.2;
};
const unhover = (_, index, elements) => {
    elements[index].style.stroke = 'none';
    elements[index].style.opacity = 1;
};
const updateHovers = () => {
    const scale = axis.scale();
    const width = Math.abs(scale(1) - scale(0));
    zoomExtent.selectAll('rect')
        .attr('x', (_, i) => scale(i))
        .attr('width', width);
};

const makeHovers = (data, focusAxis) => {
    const { bottom, top } = focus.node().getBoundingClientRect();
    axis = focusAxis;

    zoomExtent.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', 'view')
        .attr('y', top)
        .attr('height', bottom - focusOffset)
        .on('mouseover', hover)
        .on('mouseout', unhover);
};

export { makeHovers, updateHovers };
