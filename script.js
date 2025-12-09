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

darkToggle.onclick = () => document.body.classList.toggle("dark-mode");

// Jahre 1950–2025
for (let y = 2025; y >= 1950; y--) {
  let opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearInput.appendChild(opt);
}

// Genres laden
fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=de`)
  .then(r => r.json())
  .then(d => {
    d.genres.forEach(g => {
      let opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      genreInput.appendChild(opt);
    });
  });

// Plattformen laden
fetch(`https://api.themoviedb.org/3/watch/providers/movie?api_key=${apiKey}&watch_region=CH`)
  .then(r => r.json())
  .then(d => {
    Object.values(d.results).forEach(p => {
      let opt = document.createElement("option");
      opt.value = p.provider_id;
      opt.textContent = p.provider_name;
      platformInput.appendChild(opt);
    });
  });

form.addEventListener("submit", async e => {
  e.preventDefault();

  resultsList.innerHTML = "";
  messageBox.classList.add("hidden");
  sortContainer.classList.add("hidden"); // Sortierung erst ausblenden

  const title = titleInput.value.trim();
  const year = yearInput.value;
  const genre = genreInput.value;
  const platform = platformInput.value;

  if (!title && !year && !genre && !platform) {
    return showMessage("Bitte mindestens einen Suchfilter ausfüllen.");
  }

  const hasLettersOrNumbers = /[A-Za-z0-9äöüÄÖÜß]/.test(title);
  if (title && !hasLettersOrNumbers) {
    return showMessage("Der Titel muss Buchstaben oder Zahlen enthalten.");
  }

  if (title && title.length < 2) {
    return showMessage("Der Titel muss mindestens 2 Zeichen lang sein.");
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

    // Sortieroption nur anzeigen, wenn Ergebnisse da sind
    sortContainer.classList.remove("hidden");

    let movies = data.results.slice(); // Kopie für Sortierung

    // Sortierung bei Änderung
    sortInput.onchange = () => {
      let value = sortInput.value;
      if (value === "original_title.asc") movies.sort((a,b) => a.title.localeCompare(b.title));
      else if (value === "primary_release_date.desc") movies.sort((a,b) => (b.release_date||"").localeCompare(a.release_date||""));
      else if (value === "primary_release_date.asc") movies.sort((a,b) => (a.release_date||"").localeCompare(b.release_date||""));
      else if (value === "popularity.desc") movies.sort((a,b) => b.popularity - a.popularity);
      renderResults(movies);
    };

    renderResults(movies);

  } catch (err) {
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

    const details = document.createElement("div");
    details.className = "details";

    card.append(titleEl, yearEl, details);
    resultsList.appendChild(card);

    let open = false;

    card.onclick = async () => {
      open = !open;
      details.style.display = open ? "block" : "none";
      if (!open) return;

      const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&append_to_response=credits`);
      const info = await detailRes.json();

      details.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w342${info.poster_path}">
        <p><b>Genre:</b> ${info.genres.map(g => g.name).join(", ")}</p>
        <p><b>Beschreibung:</b><br>${info.overview}</p>
        <p><b>Schauspieler:</b><br>${info.credits.cast.slice(0,6).map(a=>a.name).join(", ")}</p>
      `;
    };
  });
}

function showMessage(text) {
  messageBox.textContent = text;
  messageBox.classList.remove("hidden");
}
