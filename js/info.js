const updateInfo = datum => {
    const details = document.querySelector('.info-details');
    if (!datum) {
        return details.innerHTML = '<p>Choose something!</p>';
    }

    const features = datum.FEATURES
        .filter(f => f[2])
        .map(f => `<li class="feature" style="color: ${f[1]}">${f[0]}</li>`)
        .join('');

    details.innerHTML = `
        <h1 class="title">${datum.TITLE}</h1>
        <h3 class="season">Season: ${datum.SEASON}</h3>
        <h3 class="episode">Episode: ${datum.EPISODE}</h3>
        <ul class="features">${features}</ul>
    `;
};

export default updateInfo;
