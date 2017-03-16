import { select, mouse } from 'd3';

import { focusOffset, mapOffset } from './constants';
import { focus, zoomExtent } from './elements';
import updateInfo from './info';

let activeIndex = null;
let axis;
let groups;

const detectColor = () => {
    const [x, y] = mouse(focus.node());
    const context = focus.node().getContext('2d');
    const [r, g, b] = context.getImageData(x * 2, y * 2 - mapOffset, 1, 1).data;
    return '#' + ('000000' + ((r << 16) | (g << 8) | b).toString(16)).slice(-6);
};

const activate = (datum, view, index) => {
    view.parentElement.classList.add('active');
    select(view).on('mousemove', () => updateInfo(datum, detectColor()));
    activeIndex = index;
    updateInfo(datum);
};

const deactivate = view => {
    view.parentElement.classList.remove('active');
    select(view).on('mousemove', null);
    activeIndex = null;
    updateInfo();
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

const updateHovers = () => {
    const scale = axis.scale();
    const width = Math.abs(scale(1) - scale(0));

    // resize and position each contained rect
    groups._groups[0].forEach((group, index) => {
        group.firstElementChild.setAttribute('x', scale(index));
        group.firstElementChild.setAttribute('width', width);
    });
};

const makeHovers = (data, focusAxis) => {
    const { bottom, top } = focus.node().getBoundingClientRect();
    axis = focusAxis;

    groups = zoomExtent.selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('class', 'view');

    // TODO: clip to slice that is visible and work add/remove into updateHovers
    groups.append('rect')
        .attr('y', top)
        .attr('height', bottom - focusOffset)
        .on('click', toggle);
};

export { makeHovers, updateHovers };
