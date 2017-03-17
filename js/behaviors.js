import * as d3 from 'd3';

import { height, width } from './constants';
import { focus, zoomExtent } from './elements';
import { updateHovers } from './hover';

const zoomFocus = (x, constX, updateFocus) => {
    const zoomed = () => {
        x.domain(d3.event.transform.rescaleX(constX).domain());
        updateFocus();
        updateHovers();
    };

    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width - 240, height]])
        .extent([[0, 0], [width - 240, height]])
        .on('zoom', zoomed);

    const focusBox = focus.node().getBoundingClientRect();
    zoomExtent
        .attr('y', focusBox.top)
        .attr('width', focusBox.width)
        .attr('height', focusBox.height)
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity.scale(31))
        .call(updateHovers);
};

export { zoomFocus };
