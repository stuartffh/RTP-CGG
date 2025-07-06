let gamesData = [];
let currentSort = null;
let toastTimeout;
let isFirstLoad = true;
let alerts = [];
let alertSound;
let winnersInterval;
let winnersModal;
let gameModal;
let modalGameId = null;
let socket;
const IMAGE_ENDPOINT = '/imagens';

function setupWinnersModal() {
    const modalEl = document.getElementById('winnersModal');
    if (!modalEl) return;
    const dialog = modalEl.querySelector('.modal-dialog');
    const header = modalEl.querySelector('.modal-header');
    const minimizeBtn = document.getElementById('minimize-winners');

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    header.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        dragging = true;
        const rect = dialog.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        dialog.style.position = 'fixed';
        dialog.style.margin = '0';
    });

    document.addEventListener('mousemove', (e) => {
        if (!dragging) return;
        dialog.style.left = `${e.clientX - offsetX}px`;
        dialog.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener('mouseup', () => {
        dragging = false;
    });

    minimizeBtn?.addEventListener('click', () => {
        modalEl.classList.toggle('modal-minimized');
    });
}
const ALERT_SOUND_SRC='data:audio/wav;base64,UklGRqQMAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YYAMAAAAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQAAgVr/f4FaAAB/pQGAf6UAAIFa/3+BWgAAf6UBgH+lAACBWv9/gVoAAH+lAYB/pQ==';
const gameCards = new Map();

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

function applyPriorities(games) {
    const sorted = [...games].sort((a, b) => (a.extra ?? 0) - (b.extra ?? 0));
    sorted.forEach(g => {
        const val = g.extra ?? 0;
        if (val <= -200) {
            g.prioridade = '🔥 Alta prioridade';
        } else if (val < 0) {
            g.prioridade = '⚠️ Média prioridade';
        } else {
            g.prioridade = '✅ Neutra ou positiva';
        }
    });
    return sorted;
}

function handleGamesData(data) {
    gamesData = window.IS_MELHORES_PAGE ? applyPriorities(data) : data;
    alerts.forEach(alert => {
        const game = gamesData.find(
            g => g.name.toLowerCase() === alert.name.toLowerCase(),
        );
        if (!game) return;
        const rtp = game.rtp / 100;
        if (
            (alert.type === 'up' && rtp >= alert.value) ||
            (alert.type === 'down' && rtp <= alert.value)
        ) {
            alertSound?.play().catch(err => console.error('Falha ao tocar alerta', err));
        }
    });
    populateProviders();
    if (currentSort) {
        sortBy(currentSort);
    } else {
        filterAndRender();
    }
    const statusEl = document.getElementById('status-message');
    if (statusEl) {
        statusEl.classList.add('d-none');
        statusEl.textContent = '';
    }
    if (isFirstLoad) isFirstLoad = false;
    updateGameModal();
}

// Busca lista de jogos do backend
async function fetchGames(showSpinner = false) {
    const spinner = document.getElementById('loading-spinner');
    const statusEl = document.getElementById('status-message');

    try {
        if (spinner && showSpinner) spinner.classList.remove('d-none');
        const response = await fetch('/api/games');
        if (!response.ok) throw new Error('Erro na resposta da rede');

        const data = await response.json();
        handleGamesData(data);
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

async function fetchWinners() {
    try {
        const res = await fetch("/api/last-winners");
        if (!res.ok) throw new Error("Falha na rede");
        const data = await res.json();
        const winners = Array.isArray(data) ? data : data.items || [];
        const list = document.getElementById("winners-list");
        if (!list) return;
        list.innerHTML = "";
        winners.forEach(w => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            if (w && w.name && w.last_winner) {
                const amount = w.last_winner.money.amount / (w.last_winner.money_multiplier || 1);
                const currency = w.last_winner.money.currency || "";
                li.textContent = `${w.name} - ${w.last_winner.user_name_cut} - ${amount} ${currency}`;
            } else if (typeof w === "string") {
                li.textContent = w;
            } else {
                li.textContent = JSON.stringify(w);
            }
            list.appendChild(li);
        });
    } catch (err) {
        console.error("Erro ao buscar vencedores", err);
    }
}

function connectSocket() {
    socket = io();
    socket.on('games_update', data => handleGamesData(data));
}


function fillGameModal(game) {
    document.getElementById('gameModalLabel').textContent = game.name;
    const imgEl = document.getElementById('gameModalImg');
    if (imgEl) {
        imgEl.src = `${IMAGE_ENDPOINT}/${game.id}.webp`;
        imgEl.alt = `Imagem de ${game.name}`;
    }
    const provEl = document.getElementById('gameModalProvider');
    if (provEl) provEl.textContent = `Provedor: ${game.provider.name}`;
    const dailyStrong = document.getElementById('gameModalDaily');
    const dailyBadge = document.getElementById('gameModalDailyBadge');
    if (dailyStrong)
        dailyStrong.textContent = `${(game.rtp / 100).toFixed(2)}%`;
    if (dailyBadge)
        dailyBadge.innerHTML = {
            down: '<span class="badge bg-danger">▼ Dia</span>',
            up: '<span class="badge bg-success">▲ Dia</span>',
            neutral: '<span class="badge bg-secondary">▬ Dia</span>',
        }[game.rtp_status || 'neutral'];
    const weeklyStrong = document.getElementById('gameModalWeekly');
    const weeklyBadge = document.getElementById('gameModalWeeklyBadge');
    const weekVal = game.rtp_semana ?? null;
    if (weeklyStrong)
        weeklyStrong.textContent =
            weekVal !== null ? `${(weekVal / 100).toFixed(2)}%` : '--';
    if (weeklyBadge)
        weeklyBadge.innerHTML = {
            down: '<span class="badge bg-danger">▼ Semana</span>',
            up: '<span class="badge bg-success">▲ Semana</span>',
            neutral: '<span class="badge bg-secondary">▬ Semana</span>',
        }[game.status_semana || 'neutral'];
}

function updateGameModal() {
    if (modalGameId === null) return;
    const game = gamesData.find(g => g.id === modalGameId);
    if (!game) {
        modalGameId = null;
        gameModal?.hide();
        return;
    }
    if (!gameModal) {
        const el = document.getElementById('gameModal');
        if (el) gameModal = new bootstrap.Modal(el);
        else return;
    }
    fillGameModal(game);
}

function openGameModal(id) {
    modalGameId = id;
    const game = gamesData.find(g => g.id === id);
    if (!game) return;
    if (!gameModal) {
        const el = document.getElementById('gameModal');
        if (el) gameModal = new bootstrap.Modal(el);
    }
    if (!gameModal) return;
    fillGameModal(game);
    gameModal.show();
}


// Exibe os jogos na tela
function createGameCard(game, imgUrl, dailyBadge, weeklyBadge, rtpStatus) {
    const wrapper = document.createElement('div');
    wrapper.className = 'game-card';
    wrapper.dataset.status = rtpStatus;
    wrapper.dataset.id = game.id;

    const card = document.createElement('div');
    card.className = 'card bg-dark text-white h-100';

    const img = document.createElement('img');
    img.className = 'card-img-top game-img img-fluid';
    img.alt = `Imagem de ${game.name}`;
    img.src = imgUrl;
    img.addEventListener('click', () => openGameModal(game.id));

    const body = document.createElement('div');
    body.className = 'card-body text-center';

    const title = document.createElement('h5');
    title.className = 'card-title';
    title.title = 'Clique para copiar';
    title.textContent = game.name;

    const provider = document.createElement('p');
    provider.className = 'card-text mb-1';
    provider.textContent = `Provedor: ${game.provider.name}`;

    const prioridade = document.createElement('p');
    prioridade.className = 'mb-1';
    prioridade.textContent = game.prioridade || '';

    const rtpContainer = document.createElement('div');
    rtpContainer.className = 'rtp-container';

    const dailyDiv = document.createElement('div');
    const dailyStrong = document.createElement('strong');
    dailyStrong.textContent = `${(game.rtp / 100).toFixed(2)}%`;
    const dailyBadgeDiv = document.createElement('div');
    dailyBadgeDiv.innerHTML = dailyBadge;
    dailyDiv.appendChild(dailyStrong);
    dailyDiv.appendChild(dailyBadgeDiv);

    const weeklyDiv = document.createElement('div');
    const weeklyStrong = document.createElement('strong');
    const weeklyValue = game.rtp_semana ?? null;
    weeklyStrong.textContent =
        weeklyValue !== null ? `${(weeklyValue / 100).toFixed(2)}%` : '--';
    const weeklyBadgeDiv = document.createElement('div');
    weeklyBadgeDiv.innerHTML = weeklyBadge;
    weeklyDiv.appendChild(weeklyStrong);
    weeklyDiv.appendChild(weeklyBadgeDiv);

    rtpContainer.appendChild(dailyDiv);
    rtpContainer.appendChild(weeklyDiv);

    body.appendChild(title);
    body.appendChild(provider);
    if (game.prioridade) body.appendChild(prioridade);
    body.appendChild(rtpContainer);

    card.appendChild(img);
    card.appendChild(body);
    wrapper.appendChild(card);

    return {
        wrapper,
        img,
        title,
        provider,
        prioridade,
        dailyStrong,
        dailyBadgeDiv,
        weeklyStrong,
        weeklyBadgeDiv,
    };
}

function displayGames(games) {
    const container = document.getElementById('games-container');
    if (!container) return;
    const fragment = document.createDocumentFragment();
    const present = new Set();

    games.forEach(game => {
        present.add(game.id);
        const imgUrl = `${IMAGE_ENDPOINT}/${game.id}.webp`;
        const rtpStatus = game.rtp_status || 'neutral';
        const dailyBadge = {
            down: '<span class="badge bg-danger rtp-badge">▼ Dia</span>',
            up: '<span class="badge bg-success rtp-badge">▲ Dia</span>',
            neutral: '<span class="badge bg-secondary rtp-badge">▬ Dia</span>',
        }[rtpStatus];

        const weeklyStatus = game.status_semana || 'neutral';
        const weeklyBadge = {
            down: '<span class="badge bg-danger rtp-badge">▼ Semana</span>',
            up: '<span class="badge bg-success rtp-badge">▲ Semana</span>',
            neutral: '<span class="badge bg-secondary rtp-badge">▬ Semana</span>',
        }[weeklyStatus];

        let cardData = gameCards.get(game.id);
        if (!cardData) {
            cardData = createGameCard(
                game,
                imgUrl,
                dailyBadge,
                weeklyBadge,
                rtpStatus,
            );
            gameCards.set(game.id, cardData);
        } else {
            const {
                wrapper,
                img,
                title,
                provider,
                prioridade,
                dailyStrong,
                dailyBadgeDiv,
                weeklyStrong,
                weeklyBadgeDiv,
            } = cardData;
            wrapper.dataset.status = rtpStatus;
            wrapper.dataset.id = game.id;
            img.src = imgUrl;
            img.alt = `Imagem de ${game.name}`;
            title.textContent = game.name;
            provider.textContent = `Provedor: ${game.provider.name}`;
            if (prioridade)
                prioridade.textContent = game.prioridade || '';
            dailyStrong.textContent = `${(game.rtp / 100).toFixed(2)}%`;
            dailyBadgeDiv.innerHTML = dailyBadge;
            const weeklyValue = game.rtp_semana ?? null;
            weeklyStrong.textContent =
                weeklyValue !== null
                    ? `${(weeklyValue / 100).toFixed(2)}%`
                    : '--';
            weeklyBadgeDiv.innerHTML = weeklyBadge;
        }

        fragment.appendChild(cardData.wrapper);
    });

    container.replaceChildren(fragment);

    for (const id of Array.from(gameCards.keys())) {
        if (!present.has(id)) {
            gameCards.delete(id);
        }
    }
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
    setupWinnersModal();
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.addEventListener('input', handleSearchInput);
    document.getElementById('provider-select')?.addEventListener('change', filterAndRender);
    document.getElementById('show-positive')?.addEventListener('change', filterAndRender);
    document.getElementById('show-negative')?.addEventListener('change', filterAndRender);
    document.getElementById('min-rtp')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('max-rtp')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('show-winners')?.addEventListener('change', async e => {
        if (e.target.checked) {
            if (!winnersModal) {
                const el = document.getElementById('winnersModal');
                if (el) winnersModal = new bootstrap.Modal(el);
            }
            await fetchWinners();
            winnersModal?.show();
            winnersInterval = setInterval(fetchWinners, 1000);
        } else {
            clearInterval(winnersInterval);
            winnersInterval = null;
            winnersModal?.hide();
        }
    });
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
    connectSocket();
