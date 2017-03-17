import * as d3 from 'd3';

import { height, width } from './constants';
import { stream, zoomExtent } from './elements';
import { updateHovers } from './hover';

const zoomStream = (x, constX, update) => {
    const zoomed = () => {
        x.domain(d3.event.transform.rescaleX(constX).domain());
        update();
        updateHovers();
    };

    const zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width - 240, height]])
        .extent([[0, 0], [width - 240, height]])
        .on('zoom', zoomed);

    const box = stream.node().getBoundingClientRect();
    zoomExtent
        .attr('y', box.top)
        .attr('width', box.width)
        .attr('height', box.height)
        .call(zoom)
        .call(zoom.transform, d3.zoomIdentity.scale(31))
        .call(updateHovers);
};

export { zoomStream };
