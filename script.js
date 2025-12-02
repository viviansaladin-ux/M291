const apiKey = "aca130ccbef1edf6e20eabe0354bcea5"; // Dein TMDb API Key

const titleInput = document.getElementById("titleInput");
const yearInput = document.getElementById("yearInput");
const searchForm = document.getElementById("searchForm");
const resultsDiv = document.getElementById("results");
const detailsDiv = document.getElementById("details");
const darkToggle = document.getElementById("darkModeToggle");

// Dark Mode Toggle
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  searchMovies();
});

async function searchMovies() {
  const title = titleInput.value.trim();
  const year = yearInput.value.trim();

  let url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title || "")}`;

  if (!title && year) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&primary_release_year=${year}`;
  }

  if (title && year) {
    url += `&year=${year}`;
  }

  resultsDiv.innerHTML = "";
  detailsDiv.classList.add("hidden");

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p style='color:white'>Keine Ergebnisse gefunden.</p>";
      return;
    }

    data.results.forEach(movie => {
      const item = document.createElement("div");
      item.classList.add("result-item");
      const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "?";
      item.textContent = `${movie.title} (${releaseYear})`;
      item.addEventListener("click", () => loadDetails(movie.id));
      resultsDiv.appendChild(item);
    });
  } catch (err) {
    resultsDiv.innerHTML = "<p style='color:white'>Fehler beim Laden der Daten.</p>";
    console.error(err);
  }
}

async function loadDetails(id) {
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&append_to_response=credits`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    resultsDiv.innerHTML = "";
    detailsDiv.classList.remove("hidden");

    detailsDiv.innerHTML = `
      <h2>${data.title}</h2>
      <p><strong>Jahr:</strong> ${data.release_date ? data.release_date.slice(0,4) : "?"}</p>
      <p><strong>Genre:</strong> ${data.genres.map(g => g.name).join(", ")}</p>
      <p><strong>Beschreibung:</strong><br><br>${data.overview || "Keine Beschreibung vorhanden."}</p>
      <p><strong>Schauspieler:</strong></p>
      <ul>
        ${data.credits.cast.slice(0,12).map(a => `<li>${a.name}</li>`).join("")}
      </ul>
    `;
  } catch (err) {
    detailsDiv.innerHTML = "<p style='color:red'>Fehler beim Laden der Details.</p>";
    console.error(err);
  }
}
