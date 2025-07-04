let gamesData = [];
let currentSort = null;
let toastTimeout;

function showToast(message) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
}

async function fetchGames() {
    const spinner = document.getElementById('loading-spinner');
    const statusEl = document.getElementById('status-message');
    try {
        if (spinner) spinner.classList.remove('d-none');
        const response = await fetch('/api/games');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        gamesData = await response.json();

        const statusEl = document.getElementById('status-message');
        if (currentSort) {
            sortBy(currentSort);
        } else {
            displayGames(gamesData);
        }
        if (statusEl) {
            statusEl.classList.add('d-none');
            statusEl.textContent = '';
        }

        filterAndRender();
    } catch (error) {
        console.error('Erro ao buscar os jogos:', error);
        const message = 'Não foi possível carregar os jogos. Tente novamente mais tarde.';
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.classList.remove('d-none');
        } else {
            alert(message);
        }
    } finally {
        if (spinner) spinner.classList.add('d-none');
    }
    }
}

function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';

    games.forEach(game => {
        const gameId = game.id;
        const imgUrl = `https://cgg.bet.br/static/v1/casino/game/0/${gameId}/big.webp`;

        const rtpStatus = game.rtp_status || 'neutral';
        const statusBadge = {
            down: '<span class="badge bg-danger rtp-badge">▼ RTP Baixo</span>',
            up: '<span class="badge bg-success rtp-badge">▲ RTP Alto</span>',
            neutral: '<span class="badge bg-secondary rtp-badge">▬ Neutro</span>'
        }[rtpStatus];

        container.innerHTML += `
            <div class="col game-card">
                <div class="card bg-dark text-white h-100">
                    <img src="${imgUrl}" class="card-img-top game-img img-fluid" alt="Imagem de ${game.name}">
                    <div class="card-body text-center">
                        <h5 class="card-title" title="Clique para copiar">${game.name}</h5>
                        <p class="card-text mb-1">Provedor: ${game.provider.name}</p>
                        <p class="card-text">
                            RTP: <strong>${(game.rtp / 100).toFixed(2)}%</strong> ${statusBadge}
                        </p>
                    </div>
                </div>
            </div>`;
    });
}

function sortBy(criteria, skipRender = false) {
    currentSort = criteria;
    if (criteria === 'rtp') {
        gamesData.sort((a, b) => b.rtp - a.rtp);
    } else if (criteria === 'name') {
        gamesData.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (!skipRender) {
        filterAndRender();
    }
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(null, args), delay);
    };
}

function filterAndRender() {
    const query = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
    let filtered = gamesData;
    if (query) {
        filtered = gamesData.filter(game => game.name.toLowerCase().includes(query));
    }

    if (currentSort === 'rtp') {
        filtered = [...filtered].sort((a, b) => b.rtp - a.rtp);
    } else if (currentSort === 'name') {
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    displayGames(filtered);
}

const handleSearchInput = debounce(filterAndRender, 300);

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
});

setInterval(fetchGames, 2000);
fetchGames();

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('card-title')) {
        const text = e.target.textContent.trim();
        try {
            await navigator.clipboard.writeText(text);
            showToast('Nome copiado!');
        } catch (err) {
            console.error('Erro ao copiar nome:', err);
            showToast('Falha ao copiar');
        }
    }
});
