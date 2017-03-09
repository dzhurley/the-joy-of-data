import * as d3 from 'd3';

import { height, width } from './constants';
import { focus, map, svg, zoomExtent } from './elements';

// save for coordinating in other handlers
let brush, zoom;

const brushMap = ({ focusX, mapX }, updateFocus) => {
    const brushed = () => {
        // ignore brush-by-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
        const scale = d3.event.selection || mapX.range();
        focusX.domain(scale.map(mapX.invert, mapX));
        updateFocus();
        zoomExtent.call(zoom.transform, d3.zoomIdentity
            .scale(width / (scale[1] - scale[0]))
            .translate(-scale[0], 0));
    };

    const mapBox = map.node().getBoundingClientRect();
    brush = d3.brushX()
        .extent([[mapBox.left, mapBox.top], [mapBox.right, mapBox.bottom]])
        .on('brush', brushed);

    svg.append('g')
        .attr('class', 'brush')
        .call(brush);
};

const zoomFocus = ({ focusX, mapX }, updateFocus) => {
    const zoomed = () => {
        // ignore zoom-by-brush
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        const transform = d3.event.transform;
        focusX.domain(transform.rescaleX(mapX).domain());
        updateFocus();
        d3.select('.brush').call(brush.move, mapX.range().map(transform.invertX, transform));
    };

    zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    const focusBox = focus.node().getBoundingClientRect();
    zoomExtent
        .attr('x', focusBox.left)
        .attr('y', focusBox.top)
        .attr('width', focusBox.width)
        .attr('height', focusBox.height)
        .call(zoom);
};

export { brushMap, zoomFocus };
