const modalImage = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalCategory = document.getElementById("modalCategory");
const modalDescription = document.getElementById("modalDescription");
const modalPlayer = document.getElementById("modalPlayer");
const playerLanguage = document.getElementById("playerLanguage");
const closeModalBtn = document.getElementById("closeModalBtn");
const myListBtn = document.getElementById("myListBtn");
const playNowBtn = document.getElementById("playNowBtn");
const downloadBtn = document.getElementById("downloadBtn");
const watchStatus = document.getElementById("watchStatus");
const watchLinks = document.getElementById("watchLinks");
const episodePanel = document.getElementById("episodePanel");
const seasonSelect = document.getElementById("seasonSelect");
const episodeSelect = document.getElementById("episodeSelect");
const nextEpisodeBtn = document.getElementById("nextEpisodeBtn");
const ratingInput = document.getElementById("ratingInput");
const reviewInput = document.getElementById("reviewInput");
const submitReviewBtn = document.getElementById("submitReviewBtn");
const reviewList = document.getElementById("reviewList");
const modalMatch = document.getElementById("modalMatch");
const modalYear = document.getElementById("modalYear");
const modalMaturity = document.getElementById("modalMaturity");
const modalRuntime = document.getElementById("modalRuntime");
const modalLanguageChips = document.getElementById("modalLanguageChips");
const modalCast = document.getElementById("modalCast");
const modalMoreLikeGrid = document.getElementById("modalMoreLikeGrid");
const modalTabAccent = document.getElementById("modalTabAccent");
const modalTabButtons = Array.from(document.querySelectorAll(".modal-tab-btn"));
const modalMoreLikePanel = document.getElementById("modalTabMoreLike");
const modalMoreDetailsPanel = document.getElementById("modalTabMoreDetails");
const heroPreviewBtn = document.getElementById("heroPreviewBtn");
const heroTrailerBtn = document.getElementById("heroTrailerBtn");
const quickRateBtn = document.getElementById("quickRateBtn");
const quickShareBtn = document.getElementById("quickShareBtn");
const quickReportBtn = document.getElementById("quickReportBtn");
const watchContent = document.querySelector(".watch-content");
const watchEmptyState = document.getElementById("watchEmptyState");

const watchSelectedKey = "flixoraWatchSelectedV1";
const watchCatalogKey = "flixoraWatchCatalogV1";
const fallbackPoster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='675' viewBox='0 0 1200 675'%3E%3Crect width='1200' height='675' fill='%23090909'/%3E%3Ctext x='50%25' y='48%25' fill='%23e50914' font-size='86' font-family='Arial' font-weight='700' text-anchor='middle'%3EFLIXORA%3C/text%3E%3Ctext x='50%25' y='58%25' fill='%23d0d0d0' font-size='32' font-family='Arial' text-anchor='middle'%3EWatch Screen%3C/text%3E%3C/svg%3E";

let selectedItem = null;
let catalog = [];

function parseJson(raw, fallback) {
    try {
        return JSON.parse(raw || JSON.stringify(fallback));
    } catch (err) {
        return fallback;
    }
}

function readState(key, fallback) {
    const raw = sessionStorage.getItem(key) || localStorage.getItem(key);
    return parseJson(raw, fallback);
}

function currentUser() {
    return (localStorage.getItem("flixoraUser") || "guest").toLowerCase();
}

function currentProfile() {
    return (localStorage.getItem("flixoraProfile") || "Main").toLowerCase();
}

function keyFor(name) {
    return `flixora:${name}:${currentUser()}:${currentProfile()}`;
}

function readJson(key, fallback) {
    return parseJson(localStorage.getItem(key), fallback);
}

function writeJson(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function requireLogin() {
    if (!localStorage.getItem("flixoraUser")) window.location.href = "login.html";
}

function applySavedTheme() {
    if (localStorage.getItem("flixoraTheme") === "light") document.body.classList.add("light");
}

function normalizePosterUrl(url) {
    if (!url) return "";
    return String(url).trim().replace(/^http:\/\//i, "https://").replace("..jpg", ".jpg");
}

function getPosterUrl(item) {
    return normalizePosterUrl(item && (item.omdbPoster || item.poster));
}

function hasPoster(item) {
    const url = getPosterUrl(item);
    return Boolean(url && url !== fallbackPoster);
}

function formatRuntimeLabel(runtime) {
    const total = Number(runtime || 0);
    if (!total) return "?m";
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if (!hours) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
}

function getMatchPercent(item) {
    const imdb = Number(item.imdbRating || 0);
    if (imdb > 0) return Math.max(68, Math.min(99, Math.round(imdb * 10)));
    const seed = String(item.id || item.title || "")
        .split("")
        .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 78 + (seed % 17);
}

function getMaturityLabel(item) {
    const fromRating = String(item.rated || "").trim();
    if (fromRating) return fromRating;
    const maturity = String(item.maturity || "").toLowerCase();
    if (maturity === "adult") return "A 18+";
    if (maturity === "teen") return "U/A 13+";
    if (maturity === "kids") return "U";
    return "U/A";
}

function getCastLabel(item) {
    if (Array.isArray(item.cast) && item.cast.length) return `Cast: ${item.cast.slice(0, 5).join(", ")}`;
    if (typeof item.cast === "string" && item.cast.trim()) return `Cast: ${item.cast}`;
    if (typeof item.omdbActors === "string" && item.omdbActors.trim()) return `Cast: ${item.omdbActors}`;
    if (typeof item.actors === "string" && item.actors.trim()) return `Cast: ${item.actors}`;
    return "Cast: Not available.";
}

function getPreferredLanguage(item) {
    const available = Object.keys((item && item.streams) || {});
    if (!available.length) return "";
    const priority = ["English", "Hindi", "Tamil", "Telugu", "Spanish", "Korean", "Japanese", "French", "German"];
    const firstPreferred = priority.find((lang) => item.streams[lang]);
    return firstPreferred || available[0];
}

function renderLanguageChips(item) {
    modalLanguageChips.innerHTML = "";
    Object.keys((item && item.streams) || {}).forEach((lang) => {
        const chip = document.createElement("span");
        chip.className = "language-chip";
        chip.textContent = lang;
        modalLanguageChips.appendChild(chip);
    });
}

function setPlayButtonLabel(label) {
    playNowBtn.innerHTML = '<span class="btn-symbol">&#9654;</span><span class="play-label"></span>';
    const text = playNowBtn.querySelector(".play-label");
    if (text) text.textContent = label;
}

function setPrimaryWatchLink(item, source) {
    if (!source || !source.web_url) {
        item.primaryWatchLink = null;
        return;
    }
    item.primaryWatchLink = {
        name: source.name || "Provider",
        web_url: source.web_url
    };
}

function getPrimaryWatchLink(item) {
    if (!item) return null;
    if (item.primaryWatchLink && item.primaryWatchLink.web_url) return item.primaryWatchLink;
    const fallback = getFallbackProviderLinks(item);
    return fallback[0] || null;
}

function updatePlayButtonLabel(item) {
    const primary = getPrimaryWatchLink(item);
    setPlayButtonLabel(primary ? `Play on ${primary.name}` : "Play");
}

const providerSearchTemplates = {
    Netflix: "https://www.netflix.com/search?q={query}",
    "Prime Video": "https://www.primevideo.com/search/ref=atv_nb_sr?phrase={query}",
    JioHotstar: "https://www.hotstar.com/in/search?q={query}",
    "Disney+": "https://www.disneyplus.com/search/{query}",
    ZEE5: "https://www.zee5.com/search?query={query}",
    Zee5: "https://www.zee5.com/search?query={query}",
    SonyLIV: "https://www.sonyliv.com/search/{query}",
    "Sun NXT": "https://www.sunnxt.com/search/{query}",
    Hulu: "https://www.hulu.com/search?q={query}",
    "Apple TV+": "https://tv.apple.com/search?term={query}",
    YouTube: "https://www.youtube.com/results?search_query={query}"
};

function buildProviderSearchUrl(provider, title) {
    const template = providerSearchTemplates[provider];
    if (!template) return "";
    return template.replace("{query}", encodeURIComponent(title || ""));
}

function getFallbackProviderLinks(item) {
    const preferred = Array.isArray(item.officialProviders) ? item.officialProviders : [];
    return preferred
        .map((name) => ({ name, web_url: buildProviderSearchUrl(name, item.title) }))
        .filter((entry) => entry.web_url);
}

function appendProviderSection(title, sources, host) {
    if (!sources.length) return;
    const sec = document.createElement("div");
    sec.className = "provider-group";
    sec.innerHTML = `<p class="provider-group-title">${title}</p>`;
    const row = document.createElement("div");
    row.className = "watch-links";
    sources.forEach((source) => {
        const link = document.createElement("a");
        link.href = source.web_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "provider-link";
        link.textContent = source.name || "Provider";
        row.appendChild(link);
    });
    sec.appendChild(row);
    host.appendChild(sec);
}

function renderWatchLinks(item) {
    watchLinks.innerHTML = "";
    item.primaryWatchLink = null;

    if (item.imdbID) {
        const imdb = document.createElement("a");
        imdb.className = "provider-link";
        imdb.href = `https://www.imdb.com/title/${item.imdbID}/`;
        imdb.target = "_blank";
        imdb.rel = "noopener noreferrer";
        imdb.textContent = "Open on IMDb";
        watchLinks.appendChild(imdb);
    }

    const officialLinks = getFallbackProviderLinks(item);
    appendProviderSection("Watch Providers", officialLinks, watchLinks);
    if (officialLinks.length) setPrimaryWatchLink(item, officialLinks[0]);

    if (!watchLinks.children.length) watchStatus.textContent = "No provider links found for this title.";
    else if (item.imdbRating && item.primaryWatchLink) watchStatus.textContent = `IMDb: ${item.imdbRating} | Play opens ${item.primaryWatchLink.name}.`;
    else if (item.imdbRating) watchStatus.textContent = `IMDb: ${item.imdbRating}`;
    else if (item.primaryWatchLink) watchStatus.textContent = `Play opens ${item.primaryWatchLink.name}.`;
    else watchStatus.textContent = "Links loaded.";

    updatePlayButtonLabel(item);
}

function setModalTab(tabName) {
    const activeTab = tabName === "moreDetails" ? "moreDetails" : "moreLike";
    modalMoreLikePanel.classList.toggle("active", activeTab === "moreLike");
    modalMoreDetailsPanel.classList.toggle("active", activeTab === "moreDetails");
    modalTabButtons.forEach((btn) => {
        const isActive = btn.dataset.modalTab === activeTab;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
    });
    modalTabAccent.style.transform = activeTab === "moreDetails" ? "translateX(100%)" : "translateX(0%)";
}

function toWatchItem(item) {
    if (!item) return null;
    const copy = { ...item };
    if (item.streams) copy.streams = { ...item.streams };
    if (Array.isArray(item.categories)) copy.categories = [...item.categories];
    if (Array.isArray(item.officialProviders)) copy.officialProviders = [...item.officialProviders];
    if (Array.isArray(item.episodes)) copy.episodes = item.episodes.map((entry) => ({ ...entry }));
    return copy;
}

function persistWatchState(item) {
    const selected = toWatchItem(item);
    if (!selected) return;
    const selectedRaw = JSON.stringify(selected);
    const catalogRaw = JSON.stringify((catalog || []).map((entry) => toWatchItem(entry)));
    sessionStorage.setItem(watchSelectedKey, selectedRaw);
    sessionStorage.setItem(watchCatalogKey, catalogRaw);
    localStorage.setItem(watchSelectedKey, selectedRaw);
    localStorage.setItem(watchCatalogKey, catalogRaw);
}

function getMoreLikeItems(item) {
    const source = Array.isArray(catalog) ? catalog : [];
    const pool = source.filter((entry) => entry && entry.id !== item.id && hasPoster(entry));
    const shared = pool.filter((entry) => (entry.categories || []).some((cat) => (item.categories || []).includes(cat)));
    return [...(shared.length ? shared : pool)]
        .sort((a, b) => Number(b.imdbRating || 0) - Number(a.imdbRating || 0))
        .slice(0, 12);
}

function renderMoreLikeGrid(item) {
    modalMoreLikeGrid.innerHTML = "";
    const items = getMoreLikeItems(item);
    if (!items.length) {
        modalMoreLikeGrid.innerHTML = "<p class='notice'>No similar titles available.</p>";
        return;
    }

    items.forEach((entry) => {
        const posterUrl = getPosterUrl(entry);
        if (!posterUrl) return;
        const card = document.createElement("article");
        card.className = "modal-more-card";
        const poster = document.createElement("img");
        poster.src = posterUrl;
        poster.alt = entry.title;
        poster.loading = "lazy";
        poster.decoding = "async";
        poster.referrerPolicy = "no-referrer";
        poster.addEventListener("error", () => card.remove());
        const title = document.createElement("p");
        title.className = "modal-more-title";
        title.textContent = entry.title;
        card.appendChild(poster);
        card.appendChild(title);
        card.addEventListener("click", () => {
            selectedItem = toWatchItem(entry);
            persistWatchState(selectedItem);
            renderSelectedTitle();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        modalMoreLikeGrid.appendChild(card);
    });
}

function getContinueMap() {
    return readJson(keyFor("continue"), {});
}

function saveContinue(itemId, currentTime, duration) {
    const map = getContinueMap();
    map[itemId] = { currentTime, duration, updatedAt: new Date().toISOString() };
    writeJson(keyFor("continue"), map);
}

function reviewKey(itemId) {
    return keyFor(`reviews:${itemId}`);
}

function getReviews(itemId) {
    return readJson(reviewKey(itemId), []);
}

function addReview(itemId, rating, text) {
    const list = getReviews(itemId);
    list.unshift({
        profile: localStorage.getItem("flixoraProfile") || "Main",
        rating,
        text,
        date: new Date().toLocaleDateString()
    });
    writeJson(reviewKey(itemId), list.slice(0, 20));
}

function renderReviews(item) {
    const list = getReviews(item.id);
    reviewList.innerHTML = list.length
        ? list.map((entry) => `<p class="notice"><strong>${entry.profile}</strong> (${entry.rating}/5): ${entry.text}</p>`).join("")
        : "<p class='notice'>No reviews yet.</p>";
}

function getDownloads() {
    return readJson(keyFor("downloads"), []);
}

function saveDownloads(list) {
    writeJson(keyFor("downloads"), list);
}

function addDownload(item) {
    const list = getDownloads();
    if (list.find((entry) => entry.id === item.id)) return false;
    list.push({ id: item.id, title: item.title, progress: 0, status: "queued" });
    saveDownloads(list);
    return true;
}

function addToMyList() {
    if (!selectedItem) return;
    const list = readJson(keyFor("mylist"), []);
    if (list.find((entry) => entry.id === selectedItem.id)) {
        alert("Already in My List.");
        return;
    }
    list.push({ id: selectedItem.id, title: selectedItem.title });
    writeJson(keyFor("mylist"), list);
    alert("Added to My List.");
}

function setupEpisodes(item) {
    if (!item.episodes || !item.episodes.length) {
        episodePanel.classList.add("hidden");
        return;
    }
    episodePanel.classList.remove("hidden");
    const seasons = [...new Set(item.episodes.map((entry) => entry.season))];
    seasonSelect.innerHTML = seasons.map((season) => `<option value="${season}">Season ${season}</option>`).join("");
    const activeSeason = Number(seasonSelect.value || seasons[0]);
    const episodes = item.episodes.filter((entry) => entry.season === activeSeason);
    episodeSelect.innerHTML = episodes
        .map((entry, idx) => `<option value="${idx}">E${entry.episode} - ${entry.title}</option>`)
        .join("");
}

function playEpisodeSelection() {
    if (!selectedItem || !selectedItem.episodes || !selectedItem.episodes.length) return;
    const season = Number(seasonSelect.value || 0);
    const episodes = selectedItem.episodes.filter((entry) => entry.season === season);
    const episode = episodes[Number(episodeSelect.value || 0)];
    if (!episode || !episode.stream) return;
    modalPlayer.src = episode.stream;
    modalPlayer.play().catch(() => null);
}

function playCurrentSelection(options = {}) {
    if (!selectedItem) return;
    const previewOnly = Boolean(options.previewOnly);

    if (!previewOnly) {
        const primary = getPrimaryWatchLink(selectedItem);
        if (primary && primary.web_url) {
            window.open(primary.web_url, "_blank", "noopener,noreferrer");
            return;
        }
    }

    const selectedLanguage = playerLanguage.value;
    const fallbackLanguage = getPreferredLanguage(selectedItem);
    const streams = selectedItem.streams || {};
    const stream = streams[selectedLanguage] || streams[fallbackLanguage];
    if (!stream) return alert("No preview stream is available for this title.");
    modalPlayer.src = stream;
    modalPlayer.play().catch(() => null);
}

function openPreviewPlayer() {
    if (!selectedItem) return;
    setModalTab("moreDetails");
    playCurrentSelection({ previewOnly: true });
    modalPlayer.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function shareCurrentTitle() {
    if (!selectedItem) return;
    const shareData = {
        title: `Watch ${selectedItem.title} on Flixora`,
        text: `Check out ${selectedItem.title} on Flixora.`,
        url: window.location.href
    };
    try {
        if (navigator.share) {
            await navigator.share(shareData);
            return;
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(`${shareData.title} ${shareData.url}`);
            alert("Title link copied to clipboard.");
            return;
        }
    } catch (err) {
        return;
    }
    alert("Share is not supported on this device.");
}

function closeWatchScreen() {
    try {
        if (window.history.length > 1 && document.referrer) {
            const ref = new URL(document.referrer);
            if (ref.origin === window.location.origin) {
                window.history.back();
                return;
            }
        }
    } catch (err) {
        // Ignore and fallback to home.
    }
    window.location.href = "index.html";
}

function updateOverview(item) {
    modalTitle.textContent = item.title || "Untitled";
    modalCategory.textContent = `${item.type || "Title"} | ${(item.categories || []).join(" | ")}`;
    modalDescription.textContent = item.omdbPlot || item.description || "Description unavailable.";
    modalCast.textContent = getCastLabel(item);
    modalMatch.textContent = `${getMatchPercent(item)}% match`;
    modalYear.textContent = String(item.releaseDate || "").slice(0, 4) || "N/A";
    modalMaturity.textContent = getMaturityLabel(item);
    modalRuntime.textContent = formatRuntimeLabel(item.runtime);
    renderLanguageChips(item);
}

function renderSelectedTitle() {
    if (!selectedItem) return;
    const posterUrl = getPosterUrl(selectedItem) || fallbackPoster;
    modalImage.src = posterUrl;
    modalImage.alt = selectedItem.title || "Poster";
    modalImage.referrerPolicy = "no-referrer";
    modalImage.onerror = () => {
        modalImage.src = fallbackPoster;
        modalImage.onerror = null;
    };

    modalPlayer.pause();
    modalPlayer.src = "";
    updateOverview(selectedItem);
    renderMoreLikeGrid(selectedItem);
    setModalTab("moreLike");

    const languages = Object.keys(selectedItem.streams || {});
    playerLanguage.innerHTML = languages.length
        ? languages.map((lang) => `<option value="${lang}">${lang}</option>`).join("")
        : '<option value="">Unavailable</option>';
    const preferredLanguage = getPreferredLanguage(selectedItem);
    if (preferredLanguage) playerLanguage.value = preferredLanguage;

    setupEpisodes(selectedItem);
    renderWatchLinks(selectedItem);
    renderReviews(selectedItem);

    const params = new URLSearchParams(window.location.search);
    if (selectedItem.id) {
        params.set("id", selectedItem.id);
        const nextUrl = `watch.html?${params.toString()}`;
        if (`${window.location.pathname}${window.location.search}`.endsWith(nextUrl) === false) {
            window.history.replaceState(null, "", nextUrl);
        }
    }

    document.title = `${selectedItem.title || "Watch"} - Flixora`;
}

function showEmptyState() {
    if (watchContent) watchContent.classList.add("hidden");
    if (watchEmptyState) watchEmptyState.classList.remove("hidden");
}

function hideEmptyState() {
    if (watchContent) watchContent.classList.remove("hidden");
    if (watchEmptyState) watchEmptyState.classList.add("hidden");
}

function loadWatchState() {
    const selected = readState(watchSelectedKey, null);
    const snapshot = readState(watchCatalogKey, []);
    const routeId = new URLSearchParams(window.location.search).get("id");
    catalog = Array.isArray(snapshot) ? snapshot.filter(Boolean) : [];

    let resolved = null;
    if (routeId && catalog.length) resolved = catalog.find((entry) => String(entry.id) === String(routeId));
    if (!resolved && selected && (!routeId || String(selected.id) === String(routeId))) resolved = selected;
    if (!resolved && selected) resolved = selected;
    if (!resolved && routeId && catalog.length) resolved = catalog.find((entry) => String(entry.id) === String(routeId));
    if (!resolved && catalog.length) resolved = catalog[0];

    if (!resolved) return false;
    selectedItem = toWatchItem(resolved);
    if (!catalog.some((entry) => String(entry.id) === String(selectedItem.id))) catalog.unshift(selectedItem);
    persistWatchState(selectedItem);
    return true;
}

function bindEvents() {
    closeModalBtn.addEventListener("click", closeWatchScreen);
    heroPreviewBtn.addEventListener("click", openPreviewPlayer);
    heroTrailerBtn.addEventListener("click", openPreviewPlayer);
    playNowBtn.addEventListener("click", () => playCurrentSelection());
    myListBtn.addEventListener("click", addToMyList);
    downloadBtn.addEventListener("click", () => {
        if (!selectedItem) return;
        const added = addDownload(selectedItem);
        alert(added ? "Added to download queue." : "Already in download queue.");
    });

    quickRateBtn.addEventListener("click", () => {
        setModalTab("moreDetails");
        ratingInput.focus();
    });
    quickShareBtn.addEventListener("click", shareCurrentTitle);
    quickReportBtn.addEventListener("click", () => alert("Report sent. Thanks for the feedback."));

    modalTabButtons.forEach((btn) => btn.addEventListener("click", () => setModalTab(btn.dataset.modalTab)));

    playerLanguage.addEventListener("change", () => playCurrentSelection({ previewOnly: true }));
    seasonSelect.addEventListener("change", () => setupEpisodes(selectedItem));
    episodeSelect.addEventListener("change", playEpisodeSelection);
    nextEpisodeBtn.addEventListener("click", () => {
        if (!selectedItem || !selectedItem.episodes) return;
        const max = episodeSelect.options.length - 1;
        const next = Math.min(max, Number(episodeSelect.value || 0) + 1);
        episodeSelect.value = String(next);
        playEpisodeSelection();
    });

    submitReviewBtn.addEventListener("click", () => {
        if (!selectedItem) return;
        const rating = Number(ratingInput.value || 0);
        const text = reviewInput.value.trim();
        if (!rating || !text) return alert("Enter rating and review.");
        addReview(selectedItem.id, rating, text);
        ratingInput.value = "";
        reviewInput.value = "";
        renderReviews(selectedItem);
    });

    modalPlayer.addEventListener("timeupdate", () => {
        if (!selectedItem || !modalPlayer.duration) return;
        saveContinue(selectedItem.id, modalPlayer.currentTime, modalPlayer.duration);
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeWatchScreen();
    });
}

function init() {
    requireLogin();
    applySavedTheme();
    bindEvents();
    if (!loadWatchState()) {
        showEmptyState();
        return;
    }
    hideEmptyState();
    renderSelectedTitle();
}

init();
