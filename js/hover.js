import { select } from 'd3';

import { focusOffset, height } from './constants';
import { focus, zoomExtent } from './elements';

let activeIndex = null;
let axis;
let groups;
let key;

const activate = (datum, view, index) => {
    const x = view.x.baseVal.value + view.width.baseVal.value + 8;

    view.parentElement.classList.add('active');
    activeIndex = index;
    key = zoomExtent.select('.active')
        .append('g')
        .attr('class', 'key');

    key.selectAll('text')
        .data(datum.FEATURES.filter(d => d[2]))
      .enter().append('text')
        .attr('class', 'feature')
        .attr('x', x)
        .attr('y', (_, i) => view.y.baseVal.value + 20 + i * 16)
        .attr('fill', d => d[1])
        .text(d => d[1]);
};

const deactivate = view => {
    view.parentElement.classList.remove('active');
    activeIndex = null;
    key.remove();
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
            let x = rect.x.baseVal.value + rect.width.baseVal.value + 8;
            select(group.lastElementChild).selectAll('text').attr('x', x);
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
