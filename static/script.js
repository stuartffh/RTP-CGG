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
let socketGames = [];
let searchTimeout;
let isSearching = false;
let currentQuery = '';
let modalInterval = null;
const IMAGE_ENDPOINT = '/imagens';
let extraPosAlert = null;
let extraNegAlert = null;
const extraPosTriggered = new Set();
const extraNegTriggered = new Set();

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
const ALERT_SOUND_SRC='data:audio/ogg;codecs=opus;base64,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';
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

function loadExtraConfig() {
    const pos = parseFloat(localStorage.getItem('alert_extra_pos'));
    const neg = parseFloat(localStorage.getItem('alert_extra_neg'));
    extraPosAlert = isNaN(pos) ? null : pos;
    extraNegAlert = isNaN(neg) ? null : neg;
    const posEl = document.getElementById('alert-extra-pos');
    const negEl = document.getElementById('alert-extra-neg');
    if (posEl && extraPosAlert !== null) posEl.value = extraPosAlert;
    if (negEl && extraNegAlert !== null) negEl.value = extraNegAlert;
}

function saveExtraConfig() {
    if (extraPosAlert !== null) localStorage.setItem('alert_extra_pos', extraPosAlert);
    else localStorage.removeItem('alert_extra_pos');
    if (extraNegAlert !== null) localStorage.setItem('alert_extra_neg', extraNegAlert);
    else localStorage.removeItem('alert_extra_neg');
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

function checkExtraAlerts() {
    gamesData.forEach(g => {
        const val = typeof g.extra === 'number' ? g.extra : null;
        if (val === null) return;
        if (extraPosAlert !== null) {
            if (val >= extraPosAlert) {
                if (!extraPosTriggered.has(g.id)) {
                    alertSound?.play().catch(err => console.error('Falha ao tocar alerta', err));
                    extraPosTriggered.add(g.id);
                }
            } else {
                extraPosTriggered.delete(g.id);
            }
        }
        if (extraNegAlert !== null) {
            if (val <= extraNegAlert) {
                if (!extraNegTriggered.has(g.id)) {
                    alertSound?.play().catch(err => console.error('Falha ao tocar alerta', err));
                    extraNegTriggered.add(g.id);
                }
            } else {
                extraNegTriggered.delete(g.id);
            }
        }
    });
}

function handleGamesData(data) {
    const processed = window.IS_MELHORES_PAGE ? applyPriorities(data) : data;
    socketGames = processed;
    if (!isSearching) {
        gamesData = processed;
    }
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
    checkExtraAlerts();
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


async function fetchMelhores(showSpinner = false) {
    const spinner = document.getElementById('loading-spinner');
    const statusEl = document.getElementById('status-message');

    try {
        if (spinner && showSpinner) spinner.classList.remove('d-none');
        const response = await fetch('/api/melhores');
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

async function fetchRtpAtual(nome) {
    try {
        const resposta = await fetch('/api/search-rtp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names: [nome] }),
        });
        if (!resposta.ok) throw new Error('Falha na rede');
        return await resposta.json();
    } catch (err) {
        console.error('Erro ao buscar RTP:', err);
        return [];
    }
}

async function fetchAndDisplaySearch(query) {
    try {
        const dados = await fetchRtpAtual(query);
        if (Array.isArray(dados)) {
            gamesData = dados;
            filterAndRender();
        }
    } catch (err) {
        console.error('Erro ao atualizar RTP:', err);
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
    clearInterval(modalInterval);
    modalInterval = setInterval(async () => {
        const res = await fetchRtpAtual(game.name);
        if (Array.isArray(res) && res.length) {
            const updated = res[0];
            const idx = gamesData.findIndex(g => g.id === updated.id);
            if (idx !== -1) {
                gamesData[idx] = updated;
            }
            fillGameModal(updated);
            const cardData = gameCards.get(updated.id);
            if (cardData) {
                const rtpStatus = updated.rtp_status || 'neutral';
                const dailyBadge = {
                    down: '<span class="badge bg-danger rtp-badge">▼ Dia</span>',
                    up: '<span class="badge bg-success rtp-badge">▲ Dia</span>',
                    neutral: '<span class="badge bg-secondary rtp-badge">▬ Dia</span>',
                }[rtpStatus];
                const weeklyStatus = updated.status_semana || 'neutral';
                const weeklyBadge = {
                    down: '<span class="badge bg-danger rtp-badge">▼ Semana</span>',
                    up: '<span class="badge bg-success rtp-badge">▲ Semana</span>',
                    neutral: '<span class="badge bg-secondary rtp-badge">▬ Semana</span>',
                }[weeklyStatus];
                cardData.wrapper.dataset.status = rtpStatus;
                cardData.dailyStrong.textContent = `${(updated.rtp / 100).toFixed(2)}%`;
                cardData.dailyBadgeDiv.innerHTML = dailyBadge;
                const weeklyValue = updated.rtp_semana ?? null;
                cardData.weeklyStrong.textContent =
                    weeklyValue !== null ? `${(weeklyValue / 100).toFixed(2)}%` : '--';
                cardData.weeklyBadgeDiv.innerHTML = weeklyBadge;
                if (cardData.unidades)
                    cardData.unidades.textContent =
                        typeof updated.extra === 'number' ? `Unidades: ${updated.extra}` : '';
                if (cardData.prioridade) cardData.prioridade.textContent = updated.prioridade || '';
            }
        }
    }, 1000);
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

    const unidades = document.createElement('p');
    unidades.className = 'mb-1 unidades';
    unidades.textContent =
        typeof game.extra === 'number' ? `Unidades: ${game.extra}` : '';

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
    if (unidades.textContent) body.appendChild(unidades);
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
        unidades,
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
                unidades,
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
            if (unidades)
                unidades.textContent =
                    typeof game.extra === 'number'
                        ? `Unidades: ${game.extra}`
                        : '';
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
    const minExtra = parseFloat(document.getElementById('min-extra')?.value);
    const maxExtra = parseFloat(document.getElementById('max-extra')?.value);
    const minE = isNaN(minExtra) ? null : minExtra;
    const maxE = isNaN(maxExtra) ? null : maxExtra;

    let filtered = gamesData.filter(game => {
        if (!isSearching && query && !game.name.toLowerCase().includes(query)) return false;
        if (provider !== 'all' && game.provider.name !== provider) return false;
        if (game.rtp_status === 'up' && !showPos) return false;
        if (game.rtp_status === 'down' && !showNeg) return false;
        const rtpValue = game.rtp / 100;
        if (minRtp !== null && rtpValue < minRtp) return false;
        if (maxRtp !== null && rtpValue > maxRtp) return false;
        const extra = typeof game.extra === 'number' ? game.extra : null;
        if (minE !== null && (extra === null || extra < minE)) return false;
        if (maxE !== null && (extra === null || extra > maxE)) return false;
        return true;
    });

    displayGames(filtered);
}

const handleSearchInput = debounce(async () => {
    const termo = document.getElementById('search-input')?.value.trim();
    clearTimeout(searchTimeout);
    isSearching = !!termo;
    currentQuery = termo || '';
    if (isSearching) {
        const local = socketGames.filter(g =>
            g.name.toLowerCase().includes(currentQuery.toLowerCase())
        );
        if (local.length) {
            gamesData = local;
            filterAndRender();
        } else {
            await fetchAndDisplaySearch(currentQuery);
            searchTimeout = setTimeout(
                () => fetchAndDisplaySearch(currentQuery),
                5000
            );
        }
    } else {
        gamesData = socketGames;
        filterAndRender();
    }
}, 300);

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
    document.getElementById('min-extra')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('max-extra')?.addEventListener('input', debounce(filterAndRender, 300));
    document.getElementById('show-winners')?.addEventListener('change', async e => {
        if (e.target.checked) {
            if (!winnersModal) {
                const el = document.getElementById('winnersModal');
                if (el) winnersModal = new bootstrap.Modal(el);
            }
            await fetchWinners();
            winnersModal?.show();
            winnersInterval = setInterval(fetchWinners, 3000);
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

    document.getElementById('alert-extra-pos')?.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        extraPosAlert = isNaN(v) ? null : v;
        saveExtraConfig();
    });
    document.getElementById('alert-extra-neg')?.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        extraNegAlert = isNaN(v) ? null : v;
        saveExtraConfig();
    });

    loadAlerts();
    loadExtraConfig();
    renderAlerts();
    if (window.USE_MELHORES_API) {
        fetchMelhores(true);
    } else {
        connectSocket();
    }

    document.getElementById('gameModal')?.addEventListener('hidden.bs.modal', () => {
        clearInterval(modalInterval);
        modalInterval = null;
        modalGameId = null;
    });
