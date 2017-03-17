import { stream, zoomExtent } from './elements';
import updateInfo from './info';

let activeIndex = null;
let axis;
let colors;
let groups;

const activate = (datum, view, index) => {
    view.parentElement.classList.add('active');
    activeIndex = index;
    updateInfo(colors, datum);
    colors(datum.FEATURES.filter(f => f[2] === 1).map(f => f[1]));
};

const deactivate = view => {
    view.parentElement.classList.remove('active');
    activeIndex = null;
    updateInfo(colors);
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

const makeHovers = (data, streamAxis, setColors) => {
    const { bottom, top } = stream.node().getBoundingClientRect();
    axis = streamAxis;
    colors = setColors;

    groups = zoomExtent.selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('class', 'view');

    // TODO: clip to slice that is visible and work add/remove into updateHovers
    groups.append('rect')
        .attr('y', top)
        .attr('height', bottom)
        .on('click', toggle);

    updateInfo(colors);
};

export { makeHovers, updateHovers };
