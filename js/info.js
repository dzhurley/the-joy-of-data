import { select, selectAll } from 'd3';

const details = select('.info-details').node();

/* eslint-disable quotes */
const quotes = [
    "The only thing worse than yellow snow is green snow.",
    "I like to beat the brush.",
    "In painting, you have unlimited power. You have the ability to move mountains. You can bend rivers. But when I get home, the only thing I have power over is the garbage.",
    "You need the dark in order to show the light.",
    "Look around. Look at what we have. Beauty is everywhere - you only have to look to see it.",
    "Just go out and talk to a tree. Make friends with it.",
    "There's nothing wrong with having a tree as a friend.",
    "Trees cover up a multitude of sins.",
    "They say everything looks better with odd numbers of things. But sometimes I put even numbers - just to upset the critics.",
    "How do you make a round circle with a square knife? That's your challenge for the day.",
    "I remember when my Dad told me as a kid, 'If you want to catch a rabbit, stand behind a tree and make a noise like a carrot. Then when the rabbit comes by you grab him.' Works pretty good until you try to figure out what kind of noise a carrot makes...",
    "We tell people sometimes: we're like drug dealers, come into town and get everybody absolutely addicted to painting. It doesn't take much to get you addicted.",
    "The secret to doing anything is believing that you can do it. Anything that you believe you can do strong enough, you can do. Anything. As long as you believe.",
    "Water's like me. It's laaazy ... Boy, it always looks for the easiest way to do things",
    "Oooh, if you have never been to Alaska, go there while it is still wild. My favorite uncle asked me if I wanted to go there, Uncle Sam. He said if you don't go, you're going to jail. That is how Uncle Sam asks you.",
    "I really believe that if you practice enough you could paint the 'Mona Lisa' with a two-inch brush.",
    "We artists are a different breed of people. We're a happy bunch.",
    "We don't make mistakes. We just have happy accidents.",
];
/* eslint-enable */

const updateInfo = (update, datum) => {
    if (!datum) {
        selectAll('.info-details li').on('mousemove', null);
        select('.info-details ul').on('mouseout', null);
        update();
        return details.innerHTML = `
            <h1>The Joy of Data</h1>
            <p>Explore <a href="https://github.com/fivethirtyeight/data/blob/master/bob-ross/elements-by-episode.csv" target="_blank">data</a> from The Joy of Painting with help from <a href="https://d3js.org/" target="_blank">d3.js</a>. Click, zoom, pan, and hover to explore all the seasons!</p>
            <p class="quote">"${quotes[Math.floor(Math.random() * (quotes.length - 1))]}"</p>
            <span>- Bob Ross</span>
        `;
    }

    const features = datum.FEATURES
        .filter(f => f[2] === 1)
        .map(f => {
            f[3] = 1;
            return `<li class="feature" style="color: ${f[1]}">${f[0]}</li>`;
        })
        .join('');

    details.innerHTML = `
        <h1 class="title">${datum.TITLE}</h1>
        <h4>${datum.EPISODE}</h4>
        <ul class="features">${features}</ul>
    `;
    update(true);

    // TODO: address flipping of f[3]
    selectAll('.info-details li').on('mouseover', () => update(true));
    select('.info-details ul').on('mouseout', () => update(true));
};

export default updateInfo;
