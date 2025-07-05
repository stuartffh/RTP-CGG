let gamesData = [];
let currentSort = null;
let toastTimeout;
let isFirstLoad = true;
let alerts = [];
let alertSound;
const ALERT_SOUND_SRC='data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQ==';

// Mostra toast de feedback
function showToast(message) {
    const toast = document.getElementById('copy-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 1500);
}

function loadAlerts() {
    try {
        const saved = localStorage.getItem('alerts');
        if (saved) alerts = JSON.parse(saved);
    } catch (err) {
        console.error('Erro ao carregar alerts', err);
        alerts = [];
    }
}

function saveAlerts() {
    try {
        localStorage.setItem('alerts', JSON.stringify(alerts));
    } catch (err) {
        console.error('Erro ao salvar alerts', err);
    }
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;
    list.innerHTML = '';
    alerts.forEach((alert, idx) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.textContent = `${alert.name} ${alert.type === 'up' ? '≥' : '≤'} ${alert.value}%`;
        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-danger';
        btn.textContent = 'Remover';
        btn.addEventListener('click', () => {
            alerts.splice(idx, 1);
            saveAlerts();
            renderAlerts();
        });
        li.appendChild(btn);
        list.appendChild(li);
    });
}

// Busca lista de jogos do backend
async function fetchGames(showSpinner = false) {
    const spinner = document.getElementById('loading-spinner');
    const statusEl = document.getElementById('status-message');

    try {
        if (spinner && showSpinner) spinner.classList.remove('d-none');
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Erro na resposta da rede');

        gamesData = await response.json();
        alerts.forEach(alert => {
            const game = gamesData.find(g => g.name.toLowerCase() === alert.name.toLowerCase());
            if (!game) return;
            const rtp = game.rtp / 100;
            if ((alert.type === 'up' && rtp >= alert.value) ||
                (alert.type === 'down' && rtp <= alert.value)) {
                alertSound?.play().catch(err => console.error('Falha ao tocar alerta', err));
            }
        });
        populateProviders();

        if (currentSort) {
            sortBy(currentSort);
        } else {
            filterAndRender();
        }

        if (statusEl) {
            statusEl.classList.add('d-none');
            statusEl.textContent = '';
        }
        if (isFirstLoad) isFirstLoad = false;
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
        if (spinner && showSpinner) spinner.classList.add('d-none');
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
            down: '<span class="badge bg-danger rtp-badge">▼ RTP</span>',
            up: '<span class="badge bg-success rtp-badge">▲ RTP</span>',
            neutral: '<span class="badge bg-secondary rtp-badge">▬ Neutro</span>'
        }[rtpStatus];

        container.innerHTML += `
        <div class="game-card" data-status="${rtpStatus}">
          <div class="card bg-dark text-white h-100">
            <img src="${imgUrl}" class="card-img-top game-img img-fluid" alt="Imagem de ${game.name}">
            <div class="card-body text-center">
              <h5 class="card-title" title="Clique para copiar">${game.name}</h5>
              <p class="card-text mb-1">Provedor: ${game.provider.name}</p>
              <div class="rtp-container">
                <div><strong>${(game.rtp / 100).toFixed(2)}%</strong></div>
                <div>${statusBadge}</div>
              </div>
            </div>
          </div>
        </div>`;
      
    });
}

function populateProviders() {
    const select = document.getElementById('provider-select');
    if (!select) return;
    const providers = [...new Set(gamesData.map(g => g.provider.name))].sort();
    const current = select.value;
    select.innerHTML = '<option value="all">Todos os provedores</option>';
    providers.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        select.appendChild(opt);
    });
    if ([...select.options].some(o => o.value === current)) {
        select.value = current;
    }
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
    const provider = document.getElementById('provider-select')?.value || 'all';
    const showPos = document.getElementById('show-positive')?.checked ?? true;
    const showNeg = document.getElementById('show-negative')?.checked ?? true;
    const minRtp = parseFloat(document.getElementById('min-rtp')?.value) || null;
    const maxRtp = parseFloat(document.getElementById('max-rtp')?.value) || null;

    let filtered = gamesData.filter(game => {
        if (query && !game.name.toLowerCase().includes(query)) return false;
        if (provider !== 'all' && game.provider.name !== provider) return false;
        if (game.rtp_status === 'up' && !showPos) return false;
        if (game.rtp_status === 'down' && !showNeg) return false;
        const rtpValue = game.rtp / 100;
        if (minRtp !== null && rtpValue < minRtp) return false;
        if (maxRtp !== null && rtpValue > maxRtp) return false;
        return true;
    });

    displayGames(filtered);
}

const handleSearchInput = debounce(filterAndRender, 300);

// Copiar nome ao clicar
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

// Inicialização

    alertSound = document.getElementById('alert-sound');
    if (alertSound) alertSound.src = ALERT_SOUND_SRC;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);
    document.getElementById('provider-select')?.addEventListener('change', filterAndRender);
    document.getElementById('show-positive')?.addEventListener('change', filterAndRender);
    document.getElementById('show-negative')?.addEventListener('change', filterAndRender);
    document.getElementById('min-rtp')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('max-rtp')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('add-alert')?.addEventListener('click', () => {
        const nameEl = document.getElementById('alert-name');
        const valueEl = document.getElementById('alert-value');
        const typeEl = document.getElementById('alert-type');
        const name = nameEl?.value.trim();
        const value = parseFloat(valueEl?.value);
        const type = typeEl?.value || 'up';
        if (!name || isNaN(value)) {
            showToast('Preencha nome e valor');
            return;
        }
        alerts.push({ name, value, type });
        saveAlerts();
        renderAlerts();
        showToast('Alerta adicionado!');
        if (nameEl) nameEl.value = '';
        if (valueEl) valueEl.value = '';
    });
    loadAlerts();
    renderAlerts();
    fetchGames(true);
    setInterval(() => fetchGames(false), 1000);
