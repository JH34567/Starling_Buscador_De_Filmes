const CONFIG = window.STARLING_CONFIG || { TMDB_TOKEN: "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJmMDAzOTFmM2M5NDg3NzQ2NTJlN2UyMDA5Yjc2MTdhYyIsIm5iZiI6MTc4NjgzNTE2Ni4yMzYsInN1YiI6IjZhODBmMGRlM2ZjMTE1MTY0ZTYzYjY4YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zqfUtT5BrS6N9QKvMC8NmfZTOwTss1ByGuThLMlWwg0" };
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const demoMovies = [
  {
    id: "demo-1", title: "Interestelar", year: "2014", rating: "8.7",
    genre: "Ficção científica", runtime: "2h 49min",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    overview: "Uma equipe de exploradores viaja através de um buraco de minhoca no espaço na tentativa de garantir a sobrevivência da humanidade."
  },
  {
    id: "demo-2", title: "Matrix", year: "1999", rating: "8.2",
    genre: "Ficção científica", runtime: "2h 16min",
    poster: "https://image.tmdb.org/t/p/w500/pEoqbqtLc4CcwDUDqxmEDSWpWTZ.jpg",
    overview: "Um programador descobre que a realidade que conhece pode ser uma elaborada simulação."
  },
  {
    id: "demo-3", title: "Toy Story", year: "1995", rating: "8.0",
    genre: "Animação", runtime: "1h 21min",
    poster: "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
    overview: "Quando um novo brinquedo chega ao quarto, Woody precisa lidar com uma inesperada disputa pela atenção de Andy."
  },
  {
    id: "demo-4", title: "Homem-Aranha no Aranhaverso", year: "2018", rating: "8.4",
    genre: "Animação", runtime: "1h 57min",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    overview: "Miles Morales se torna o Homem-Aranha e encontra versões de outros heróis vindos de diferentes dimensões."
  },
  {
    id: "demo-6", title: "Divertida Mente", year: "2015", rating: "8.0",
    genre: "Animação", runtime: "1h 35min",
    poster: "https://image.tmdb.org/t/p/w500/2H1TmgdfNtsKlU9jKdeNyYL5y8T.jpg",
    overview: "Dentro da mente de uma garota, emoções personificadas tentam ajudá-la a lidar com uma grande mudança em sua vida."
  },
];

const els = {
  form: document.querySelector("#searchForm"),
  input: document.querySelector("#searchInput"),
  results: document.querySelector("#results"),
  status: document.querySelector("#statusArea"),
  title: document.querySelector("#sectionTitle"),
  kicker: document.querySelector("#sectionKicker"),
  count: document.querySelector("#resultCount"),
  surprise: document.querySelector("#surpriseButton"),
  favoritesButton: document.querySelector("#favoritesButton"),
  favoriteCount: document.querySelector("#favoriteCount"),
  details: document.querySelector("#detailsDialog"),
  detailsContent: document.querySelector("#dialogContent"),
  closeDetails: document.querySelector("#closeDialog"),
  favoritesDialog: document.querySelector("#favoritesDialog"),
  closeFavorites: document.querySelector("#closeFavorites"),
  favoritesList: document.querySelector("#favoritesList")
};

let movies = [...demoMovies];
let favorites = JSON.parse(localStorage.getItem("starling-favorites") || "[]");

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

function saveFavorites() {
  localStorage.setItem("starling-favorites", JSON.stringify(favorites));
  updateFavoriteCount();
}

function updateFavoriteCount() {
  els.favoriteCount.textContent = favorites.length;
}

function isFavorite(id) {
  return favorites.some(movie => String(movie.id) === String(id));
}

function toggleFavorite(movie) {
  if (isFavorite(movie.id)) {
    favorites = favorites.filter(item => String(item.id) !== String(movie.id));
  } else {
    favorites.push(movie);
  }
  saveFavorites();
  renderMovies(movies);
  if (els.details.open) renderDetails(movie);
}

function movieCard(movie, index) {
  const poster = movie.poster
    ? `<img class="poster" src="${escapeHTML(movie.poster)}" alt="Pôster de ${escapeHTML(movie.title)}" loading="lazy">`
    : `<div class="poster-placeholder">Pôster indisponível</div>`;

  return `
    <article class="movie-card" style="animation-delay:${index * 45}ms" data-id="${escapeHTML(movie.id)}">
      <button class="favorite-small" type="button" data-favorite="${escapeHTML(movie.id)}" aria-label="Favoritar">
        ${isFavorite(movie.id) ? "♥" : "♡"}
      </button>
      ${movie.rating ? `<span class="rating">★ ${escapeHTML(movie.rating)}</span>` : ""}
      ${poster}
      <div class="movie-info">
        <h3 class="movie-title">${escapeHTML(movie.title)}</h3>
        <div class="movie-meta">${escapeHTML(movie.year || "Ano desconhecido")} • ${escapeHTML(movie.genre || "Filme")}</div>
      </div>
    </article>
  `;
}

function renderMovies(list) {
  movies = list;
  els.results.innerHTML = list.map(movieCard).join("");
  els.count.textContent = list.length ? `${list.length} resultado${list.length > 1 ? "s" : ""}` : "";

  els.results.querySelectorAll(".movie-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("[data-favorite]")) return;
      const movie = movies.find(item => String(item.id) === String(card.dataset.id));
      if (movie) renderDetails(movie);
    });
  });

  els.results.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const movie = movies.find(item => String(item.id) === String(button.dataset.favorite));
      if (movie) toggleFavorite(movie);
    });
  });
}

function setMessage(text, type = "") {
  els.status.innerHTML = text ? `<div class="message ${type}">${text}</div>` : "";
}

async function searchTMDB(query) {
  if (!CONFIG.TMDB_TOKEN.trim()) {
    return demoMovies.filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));
  }

  const response = await fetch(`${API_BASE}/search/movie?query=${encodeURIComponent(query)}&language=pt-BR&include_adult=false`, {
    headers: { Authorization: `Bearer ${CONFIG.TMDB_TOKEN}`, "Content-Type": "application/json" }
  });

  if (!response.ok) throw new Error("Não foi possível consultar a API.");
  const data = await response.json();

  return data.results.slice(0, 12).map(item => ({
    id: item.id,
    title: item.title,
    year: item.release_date ? item.release_date.slice(0, 4) : "—",
    rating: item.vote_average ? item.vote_average.toFixed(1) : "—",
    genre: "Filme",
    runtime: "",
    poster: item.poster_path ? IMAGE_BASE + item.poster_path : "",
    overview: item.overview || "Sinopse não disponível."
  }));
}

async function searchMovie(query) {
  query = query.trim();
  if (!query) return;

  els.title.textContent = `Resultados para “${query}”`;
  els.kicker.textContent = "BUSCA";
  setMessage("Consultando a biblioteca de filmes…");
  els.results.innerHTML = "";

  try {
    let found = await searchTMDB(query);

    if (!found.length && CONFIG.TMDB_TOKEN.trim()) {
      const fallback = demoMovies.filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));
      if (fallback.length) found = fallback;
    }

    if (!found.length) {
      setMessage(`Nenhum filme encontrado para “${escapeHTML(query)}”. Tente outro título.`, "error");
    } else {
      setMessage("");
      renderMovies(found);
    }
  } catch (error) {
    const fallback = demoMovies.filter(movie => movie.title.toLowerCase().includes(query.toLowerCase()));
    if (fallback.length) {
      setMessage("API indisponível. Exibindo modo demonstração offline.");
      renderMovies(fallback);
    } else {
      setMessage("A API não está disponível no momento. O modo demonstração offline continua disponível.", "error");
    }
  }
}

function renderDetails(movie) {
  const poster = movie.poster
    ? `<img class="detail-poster" src="${escapeHTML(movie.poster)}" alt="Pôster de ${escapeHTML(movie.title)}">`
    : `<div class="poster-placeholder detail-poster">Pôster indisponível</div>`;

  els.detailsContent.innerHTML = `
    <div class="detail-layout">
      ${poster}
      <div>
        <span class="section-kicker">DETALHES DO FILME</span>
        <h2 class="detail-title">${escapeHTML(movie.title)}</h2>
        <div class="detail-meta">
          ${escapeHTML(movie.year || "Ano desconhecido")}
          ${movie.runtime ? ` • ${escapeHTML(movie.runtime)}` : ""}
          ${movie.rating ? ` • <span class="detail-rating">★ ${escapeHTML(movie.rating)}</span>` : ""}
        </div>
        <div class="detail-tags">
          <span>${escapeHTML(movie.genre || "Filme")}</span>
          <span>Starling API Lab</span>
        </div>
        <p class="detail-overview">${escapeHTML(movie.overview || "Sinopse não disponível.")}</p>
        <button class="favorite-action" type="button" id="dialogFavorite">
          ${isFavorite(movie.id) ? "♥ Remover dos favoritos" : "♡ Adicionar aos favoritos"}
        </button>
      </div>
    </div>
  `;

  els.details.showModal();
  document.querySelector("#dialogFavorite").addEventListener("click", () => toggleFavorite(movie));
}

function showFavorites() {
  els.favoritesList.innerHTML = favorites.length
    ? favorites.map(movie => `
      <div class="favorite-row">
        ${movie.poster ? `<img src="${escapeHTML(movie.poster)}" alt="">` : `<div class="poster-placeholder">★</div>`}
        <div>
          <strong>${escapeHTML(movie.title)}</strong>
          <span>${escapeHTML(movie.year || "")} • ★ ${escapeHTML(movie.rating || "—")}</span>
        </div>
        <button class="remove-favorite" data-remove="${escapeHTML(movie.id)}">Remover</button>
      </div>
    `).join("")
    : `<div class="message">Você ainda não favoritou nenhum filme. Explore e monte sua coleção.</div>`;

  els.favoritesDialog.showModal();

  els.favoritesList.querySelectorAll("[data-remove]").forEach(button => {
    button.addEventListener("click", () => {
      favorites = favorites.filter(movie => String(movie.id) !== String(button.dataset.remove));
      saveFavorites();
      showFavorites();
      renderMovies(movies);
    });
  });
}

els.form.addEventListener("submit", event => {
  event.preventDefault();
  searchMovie(els.input.value);
});

document.querySelectorAll(".quick-search").forEach(button => {
  button.addEventListener("click", () => {
    els.input.value = button.dataset.query;
    searchMovie(button.dataset.query);
  });
});

els.surprise.addEventListener("click", () => {
  const movie = demoMovies[Math.floor(Math.random() * demoMovies.length)];
  els.input.value = movie.title;
  searchMovie(movie.title);
});

els.favoritesButton.addEventListener("click", showFavorites);
els.closeDetails.addEventListener("click", () => els.details.close());
els.closeFavorites.addEventListener("click", () => els.favoritesDialog.close());

[els.details, els.favoritesDialog].forEach(dialog => {
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
});

updateFavoriteCount();
renderMovies(demoMovies);