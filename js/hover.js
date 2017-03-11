import { focusOffset } from './constants';
import { focus, focusBottom, zoomExtent } from './elements';

let axis;

const hover = (datum, index, elements) => {
    console.log('hovering', datum.EPISODE);
    elements[index].style.fill = 'green';
};
const unhover = (datum, index, elements) => {
    console.log('unhovering', datum.EPISODE);
    elements[index].style.fill = 'none';
};

const updateHovers = () => {
    const scale = axis.scale();
    const width = Math.abs(scale(1) - scale(0));
    zoomExtent.selectAll('rect')
        .attr('x', (...args) => scale(args[1]))
        .attr('width', width);

    focusBottom.call(axis);
};

const makeHovers = (data, focusAxis) => {
    const { bottom, height, top } = focus.node().getBoundingClientRect();
    axis = focusAxis;

    zoomExtent.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', 'view')
        .attr('y', top)
        .attr('height', bottom - focusOffset)
        .on('mouseover', hover)
        .on('mouseout', unhover);

    focusBottom
        .attr('transform', `translate(0, ${focusOffset + height})`)
        .call(axis);
};

export { makeHovers, updateHovers };
