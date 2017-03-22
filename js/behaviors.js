import * as d3 from 'd3';

import { height, streamWidth } from './constants';
import { brushExtent, focus, map, zoomExtent } from './elements';

import updateInfo from './info';

let activeIndex = null;
let axis, brush, groups, updateFocus, zoom;

const activate = (datum, view, index) => {
    view.parentElement.classList.add('active');
    activeIndex = index;
    updateInfo(updateFocus, datum);
};
const deactivate = view => {
    view.parentElement.classList.remove('active');
    activeIndex = null;
    updateInfo(updateFocus);
};

const toggle = (datum, index, elements) => {
    const view = elements[index];
    if (view.parentNode.classList.contains('active')) {
        deactivate(view);
        return;
    } else if (![null, index].includes(activeIndex)) {
        deactivate(elements[activeIndex]);
    }
    activate(datum, view, index);
};

const updateHoverable = () => {
    const scale = axis.scale();
    const width = Math.abs(scale(1) - scale(0));

    // resize and position each contained rect
    groups._groups[0].forEach((group, index) => {
        group.firstElementChild.setAttribute('x', scale(index));
        group.firstElementChild.setAttribute('width', width);
    });
};

const hoverable = (data, focusAxis, update) => {
    axis = focusAxis;
    updateFocus = update;

    groups = zoomExtent.selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('class', 'view');

    const box = focus.node().getBoundingClientRect();
    groups.append('rect')
        .attr('y', box.top)
        .attr('height', box.height)
        .on('click', toggle);

    updateInfo(update);
};

const brushable = (focusX, mapX) => {
    const brushed = () => {
        const scale = d3.event.selection || mapX.range();
        focusX.domain(scale.map(mapX.invert, mapX));
        // ignore brush-by-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
        zoomExtent.call(zoom.transform, d3.zoomIdentity
            .scale(streamWidth / (scale[1] - scale[0]))
            .translate(-scale[0], 0));
        updateHoverable();
    };

    const box = map.node().getBoundingClientRect();
    brush = d3.brushX()
        .extent([[box.left, box.top], [box.right, box.bottom]])
        .on('brush', brushed);

    brushExtent
        .call(brush)
        .call(brush.move, [box.left, box.right / 31])
        .call(updateHoverable);
};

const zoomable = (focusX, mapX) => {
    const zoomed = () => {
        const transform = d3.event.transform;
        focusX.domain(d3.event.transform.rescaleX(mapX).domain());
        focus.attr('transform', `translate(${transform.x}, 0) scale(${transform.k}, 1)`);
        // ignore zoom-by-brush
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        brushExtent.call(brush.move, mapX.range().map(transform.invertX, transform));
        updateHoverable();
    };

    zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [streamWidth, height]])
        .extent([[0, 0], [streamWidth, height]])
        .on('zoom', zoomed);

    const box = focus.node().getBoundingClientRect();
    zoomExtent
        .attr('y', box.top)
        .attr('width', box.width)
        .attr('height', box.height)
        .call(zoom)
        .on('dblclick.zoom', null);
};

export { brushable, hoverable, zoomable };
