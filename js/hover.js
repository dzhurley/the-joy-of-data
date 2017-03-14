import { focusOffset } from './constants';
import { focus, zoomExtent } from './elements';

let activeIndex = null;
let axis;

const activate = (view, index) => {
    view.classList.add('active');
    activeIndex = index;

    // TODO: color sampling
};

const toggle = (_, index, elements) => {
    const view = elements[index];
    if (view.classList.contains('active')) {
        view.classList.remove('active');
        return;
    }

    if (activeIndex && activeIndex !== index) {
        elements[activeIndex].classList.remove('active');
        activeIndex = null;
    }
    activate(view, index);
};

const updateHovers = () => {
    const scale = axis.scale();
    const width = Math.abs(scale(1) - scale(0));
    zoomExtent.selectAll('rect')
        .attr('x', (_, i) => scale(i))
        .attr('width', width);
    zoomExtent.selectAll('text')
        .attr('x', (_, i) => scale(i));
};

const makeHovers = (data, focusAxis) => {
    const { bottom, top } = focus.node().getBoundingClientRect();
    axis = focusAxis;

    const groups = zoomExtent.selectAll('g')
        .data(data)
        .enter().append('g')
        .attr('class', 'view');

    groups.append('rect')
        .attr('y', top)
        .attr('height', bottom - focusOffset)
        .on('click', toggle);

    groups.append('text')
        .attr('class', 'episode')
        .attr('y', top + 10)
        .text(d => d.EPISODE);
    groups.append('text')
        .attr('class', 'title')
        .attr('y', top + 20)
        .text(d => d.TITLE);
};

export { makeHovers, updateHovers };
