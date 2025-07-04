let gamesData = [];

async function fetchGames() {
    const response = await fetch('/api/games');
    gamesData = await response.json();
    displayGames(gamesData);
}

function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';

    games.forEach(game => {
        const gameId = game.id;
        const imgUrl = `https://cgg.bet.br/static/v1/casino/game/0/${gameId}/big.webp`;

        const rtpStatus = game.rtp_status || 'neutral';
        const statusBadge = {
            'down': '<span class="badge bg-danger rtp-badge">▼ RTP Baixo</span>',
            'up': '<span class="badge bg-success rtp-badge">▲ RTP Alto</span>',
            'neutral': '<span class="badge bg-secondary rtp-badge">▬ Neutro</span>'
        }[rtpStatus];

        container.innerHTML += `
            <div class="col game-card">
                <div class="card bg-dark text-white h-100">
                    <img src="${imgUrl}" class="card-img-top game-img img-fluid">
                    <div class="card-body text-center">
                        <h5 class="card-title">${game.name}</h5>
                        <p class="card-text mb-1">Provedor: ${game.provider.name}</p>
                        <p class="card-text">
                            RTP: <strong>${(game.rtp/100).toFixed(2)}%</strong> ${statusBadge}
                        </p>
                    </div>
                </div>
            </div>`;
    });
}

function sortBy(criteria) {
    if (criteria === 'rtp') {
        gamesData.sort((a, b) => b.rtp - a.rtp);
    } else if (criteria === 'name') {
        gamesData.sort((a, b) => a.name.localeCompare(b.name));
    }
    displayGames(gamesData);
}

// Atualização automática a cada 2 segundos
setInterval(fetchGames, 2000);
fetchGames();
