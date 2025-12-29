const apiKey = "aca130ccbef1edf6e20eabe0354bcea5";

const titleInput = document.getElementById("titleInput");
const yearInput = document.getElementById("yearInput");
const genreInput = document.getElementById("genreInput");
const platformInput = document.getElementById("platformInput");
const sortInput = document.getElementById("sortInput");
const sortContainer = document.getElementById("sortContainer");
const resultsList = document.getElementById("resultsList");
const messageBox = document.getElementById("messageBox");
const darkToggle = document.getElementById("darkModeToggle");
const form = document.getElementById("searchForm");

const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

darkToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
  darkToggle.textContent =
    document.body.classList.contains("dark-mode") ? "Light Mode" : "Dark Mode";
};

modalClose.onclick = () => modalOverlay.classList.add("hidden");
modalOverlay.onclick = e => {
  if (e.target === modalOverlay) modalOverlay.classList.add("hidden");
};

// Jahre
for (let y = 2025; y >= 1950; y--) {
  yearInput.add(new Option(y, y));
}

// Genres
fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=de`)
  .then(r => r.json())
  .then(d => d.genres.forEach(g => genreInput.add(new Option(g.name, g.id))));

// Plattformen
fetch(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&watch_region=CH`)
  .then(r => r.json())
  .then(d => Object.values(d.results).forEach(p =>
    platformInput.add(new Option(p.provider_name, p.provider_id))
  ));

form.addEventListener("submit", async e => {
  e.preventDefault();
  resultsList.innerHTML = "";
  messageBox.classList.add("hidden");
  sortContainer.classList.add("hidden");

  const title = titleInput.value.trim();
  const year = yearInput.value;
  const genre = genreInput.value;
  const platform = platformInput.value;

  if (!title && !year && !genre && !platform) {
    return showMessage("Bitte mindestens einen Suchfilter ausfüllen.");
  }

  let url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}`;
  if (title) url += `&with_text_query=${encodeURIComponent(title)}`;
  if (year) url += `&primary_release_year=${year}`;
  if (genre) url += `&with_genres=${genre}`;
  if (platform) url += `&with_watch_providers=${platform}&watch_region=CH`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return showMessage("Keine passenden Ergebnisse gefunden.");
    }

    sortContainer.classList.remove("hidden");
    renderResults(data.results);

  } catch {
    showMessage("Der Dienst ist momentan nicht erreichbar.");
  }
});

function renderResults(movies) {
  resultsList.innerHTML = "";

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "result-card";

    const titleEl = document.createElement("div");
    titleEl.className = "result-title";
    titleEl.textContent = movie.title;

    const yearEl = document.createElement("div");
    yearEl.textContent = movie.release_date?.slice(0,4) || "?";

    card.append(titleEl, yearEl);
    resultsList.appendChild(card);

    card.onclick = async () => {
      modalOverlay.classList.remove("hidden");
      const r = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits&language=de`
      );
      const info = await r.json();

      modalContent.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w342${info.poster_path}">
        <p><b>Genre:</b> ${info.genres.map(g => g.name).join(", ")}</p>
        <p><b>Beschreibung:</b><br>${info.overview}</p>
        <p><b>Schauspieler:</b><br>${info.credits.cast.slice(0,6).map(a => a.name).join(", ")}</p>
      `;
    };
  });
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
}
