import { zoomExtent } from './elements';

const makeHoverable = (data, x) => {
    const width = x(1);
    const { y, height } = zoomExtent.node().getBBox();
    zoomExtent.selectAll('rect')
        .data(data)
        .enter().append('rect')
        .attr('class', 'view')
        .attr('x', (...args) => width * args[1])
        .attr('y', y)
        .attr('width', width)
        .attr('height', height);
};

export { makeHoverable };
