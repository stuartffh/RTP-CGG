let gamesData = [];
let currentSort = null;
let toastTimeout;
let recInterval;
let recommendationsModal;

// Mostra toast de feedback
function showToast(message) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
}

// Busca lista de jogos do backend
async function fetchGames() {
    const spinner = document.getElementById('loading-spinner');
    const statusEl = document.getElementById('status-message');

    try {
        if (spinner) spinner.classList.remove('d-none');
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Erro na resposta da rede');

        gamesData = await response.json();

        if (currentSort) {
            sortBy(currentSort);
        } else {
            filterAndRender();
        }

        if (statusEl) {
            statusEl.classList.add('d-none');
            statusEl.textContent = '';
        }
    } catch (error) {
        console.error('Erro ao buscar jogos:', error);
        const message = 'Não foi possível carregar os jogos. Tente novamente.';
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

// Exibe os jogos na tela
function displayGames(games) {
    const container = document.getElementById('games-container');
    container.innerHTML = '';

    games.forEach(game => {
        const imgUrl = `https://cgg.bet.br/static/v1/casino/game/0/${game.id}/big.webp`;
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

// Ordena jogos
function sortBy(criteria) {
    currentSort = criteria;
    if (criteria === 'rtp') {
        gamesData.sort((a, b) => b.rtp - a.rtp);
    } else if (criteria === 'name') {
        gamesData.sort((a, b) => a.name.localeCompare(b.name));
    }
    filterAndRender();
}

// Debounce de pesquisa
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(null, args), delay);
    };
}

// Filtra e exibe jogos
function filterAndRender() {
    const query = document.getElementById('search-input')?.value.trim().toLowerCase() || '';
    let filtered = gamesData;
    if (query) {
        filtered = gamesData.filter(game => game.name.toLowerCase().includes(query));
    }

    displayGames(filtered);
}

const handleSearchInput = debounce(filterAndRender, 300);

// Gera recomendações com IA
async function generateRecommendations(auto = false) {
    const modalEl = document.getElementById('recommendationsModal');
    if (modalEl && !recommendationsModal) {
        recommendationsModal = new bootstrap.Modal(modalEl);
        modalEl.addEventListener('hidden.bs.modal', () => clearInterval(recInterval));
        document.getElementById('minimize-modal').addEventListener('click', () => {
            modalEl.querySelector('.modal-dialog').classList.toggle('minimized');
        });
    }

    const container = document.getElementById('recommendations-container');
    if (container) container.textContent = 'Gerando recomendações...';

    try {
        const response = await fetch('/api/recommendations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(gamesData)
        });
        if (!response.ok) throw new Error('Request failed');
        const data = await response.json();
        displayRecommendations(data.recomendacoes || []);
        if (!auto && recommendationsModal) {
            recommendationsModal.show();
            startRecommendationsUpdates();
        }
    } catch (err) {
        console.error('Erro ao gerar recomendações:', err);
        if (container) container.textContent = 'Falha ao gerar recomendações.';
    }
}

// Atualizações automáticas de recomendações
function startRecommendationsUpdates() {
    if (recInterval) clearInterval(recInterval);
    recInterval = setInterval(() => generateRecommendations(true), 30000);
}

// Exibe recomendações no modal
function displayRecommendations(list) {
    const container = document.getElementById('recommendations-container');
    if (!container) return;
    container.innerHTML = '<h3 class="mb-3">Recomendações</h3>';

    if (!list.length) {
        container.innerHTML += "<p>Nenhuma recomendação disponível.</p>";
        return;
    }

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'mb-2';
        const rtp = item.rtp ? `${parseFloat(item.rtp).toFixed(2)}%` : '';
        div.innerHTML = `
            <strong class="rec-name" title="Clique para copiar">${item.nome}</strong> - ${item.prioridade} ${rtp}
            <br><small>${item.motivo}</small>`;
        container.appendChild(div);
    });
}

// Copiar nome ao clicar
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('card-title') || e.target.classList.contains('rec-name')) {
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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    fetchGames();
    setInterval(fetchGames, 5000);
});
