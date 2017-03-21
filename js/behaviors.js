import * as d3 from 'd3';

import { height, streamWidth } from './constants';
import { stream, zoomExtent } from './elements';

import updateInfo from './info';

let activeIndex = null;
let axis;
let groups;
let updateStream = () => {};

const activate = (datum, view, index) => {
    view.parentElement.classList.add('active');
    activeIndex = index;
    updateInfo(updateStream, datum);
};
const deactivate = view => {
    view.parentElement.classList.remove('active');
    activeIndex = null;
    updateInfo(updateStream);
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

const hoverable = (data, streamAxis, update) => {
    const { bottom, top } = stream.node().getBoundingClientRect();
    axis = streamAxis;
    updateStream = update;

    groups = zoomExtent.selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('class', 'view');

    // TODO: clip to slice that is visible and work add/remove into updateHoverable
    groups.append('rect')
        .attr('y', top)
        .attr('height', bottom)
        .on('click', toggle);

    updateInfo(update);
};

const zoomable = (scale, constScale) => {
    const zoomed = () => {
        const { x, y, k } = d3.event.transform;
        scale.domain(d3.event.transform.rescaleX(constScale).domain());
        stream.attr('transform', `translate(${x}, ${y}) scale(${k}, 1)`);
        updateHoverable();
    };

    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [streamWidth, height]])
        .extent([[0, 0], [streamWidth, height]])
        .on('zoom', zoomed);

    const box = stream.node().getBoundingClientRect();
    zoomExtent
        .attr('y', box.top)
        .attr('width', box.width)
        .attr('height', box.height)
        .call(zoom)
        .call(updateHoverable)
        .on('dblclick.zoom', null);
};

export { hoverable, zoomable };
