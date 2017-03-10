import { focusOffset } from './constants';
import { focus, focusBottom } from './elements';

let axis;

const updateHovers = () => {
    focusBottom.call(axis);
};

const makeHovers = focusAxis => {
    const focusBox = focus.node().getBoundingClientRect();
    axis = focusAxis;
    focusBottom
        .attr('transform', `translate(0, ${focusOffset + focusBox.height})`)
        .call(axis);
};

export { makeHovers, updateHovers };
