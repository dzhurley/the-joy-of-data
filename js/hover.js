import { select } from 'd3';

import { focusOffset, height } from './constants';
import { focus, zoomExtent } from './elements';
import updateInfo from './info';

let activeIndex = null;
let axis;
let groups;

const activate = (datum, view, index) => {
    view.parentElement.classList.add('active');
    activeIndex = index;
    updateInfo(datum);
};

const deactivate = view => {
    view.parentElement.classList.remove('active');
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
        let rect = group.firstElementChild;
        rect.setAttribute('x', scale(index));
        rect.setAttribute('width', width);

        if (group.classList.contains('active')) {
            let x = rect.x.baseVal.value + rect.width.baseVal.value;
            select(group.lastElementChild).selectAll('text').attr('x', x + 8);
            select(group.lastElementChild).select('rect').attr('x', x);
        }
    });
};

const makeHovers = (data, focusAxis) => {
    const { bottom, top } = focus.node().getBoundingClientRect();
    axis = focusAxis;

    groups = zoomExtent.selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('class', 'view');

    groups.append('rect')
        .attr('y', top)
        .attr('height', bottom - focusOffset)
        .on('click', toggle);

    groups.append('text')
        .attr('class', 'episode')
        .attr('x', 16)
        .attr('y', height - 16)
        .text(d => d.EPISODE);
};

export { makeHovers, updateHovers };
