const movieList = document.getElementById("movies");

console.log("Comments added");

const APIKEY = "f531333d637d0c44abc85b3e74db2186";
let currentPage = 1;
let totalPages = 1;
let movies = [];

function getFavMoviesFromLocalStorage() {
  const favMovies = JSON.parse(localStorage.getItem("favouriteMovie"));
  return favMovies === null ? [] : favMovies;
}

function addMovieInfoInLocalStorage(mInfo) {
  const localStorageMovies = getFavMoviesFromLocalStorage();
  localStorage.setItem(
    "favouriteMovie",
    JSON.stringify([...localStorageMovies, mInfo])
  );
}

function removeFavMoviesFromLocalStorage(mInfo) {
  const localStorageMovies = getFavMoviesFromLocalStorage();
  const filteredMovies = localStorageMovies.filter(
    (eMovie) => eMovie.title != mInfo.title
  );
  localStorage.setItem("favouriteMovie", JSON.stringify(filteredMovies));
}

function renderMovies(movies = []) {
  movieList.innerHTML = "";

  const favMovies = getFavMoviesFromLocalStorage();
  const favMovMapping = favMovies.reduce((acc, curr) => {
    acc[curr.title] = true;
    return acc;
  }, {});
  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }

  console.log(favMovMapping);

  movies.forEach((eMovie) => {
    const { poster_path, title, vote_average, vote_count, release_date } =
      eMovie;

    const rs = favMovies.find((e) => e.title === eMovie.title);

    let listItem = document.createElement("div");
    listItem.className = "movie-card";
    let imageUrl = `https://image.tmdb.org/t/p/original${poster_path}`;
    let mInfo = {
      title : title.replaceAll(`'`, ``),
      vote_average,
      poster_path,
      vote_count,
      release_date,
    };
    console.log(title);

    const isFav = favMovMapping[mInfo.title];
    listItem.innerHTML = `<img
        src=${imageUrl}
        alt=${title}
        class="movie-image"
    />
    <div class="movie-details">
        <div class="movie-title">${title}</div>
        <div class="movie-heart" style="display: flex">
            <div class="movie-votes"><p>Votes: ${vote_count}</p><p>Rating: ${vote_average}</p><p>${release_date}</p></div>
            <i mInfo='${JSON.stringify(mInfo)}' class="fa-regular fa-heart fa-2xl fav-icon ${isFav ? "fa-solid" : ""}"></i>

        </div>
    </div>`;

    const favIconBTN = listItem.querySelector(".fav-icon");
        favIconBTN.addEventListener("click", (event)=>{
            // console.log(event.target);
            // console.log("MINFO", event.target.getAttribute("mInfo"))

            let mInfo = JSON.parse(event.target.getAttribute("mInfo"));
            // console.log("MINFOOO",mInfo);

            if(favIconBTN.classList.contains("fa-solid")){
                // unmark it
                // remove the class to unmark the movie visually
                favIconBTN.classList.remove("fa-solid")
                // remove this movie info from the local storage
                removeFavMoviesFromLocalStorage(mInfo);
            } else {
                // mark it
                // add the class to unmark the movie visually

                favIconBTN.classList.add("fa-solid")
                // add the movie info into local storage
                addMovieInfoInLocalStorage(mInfo);
            }
        })

    movieList.appendChild(listItem);
  });
}

async function fetchMovies() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/top_rated?api_key=${APIKEY}&language=en-US&page=${currentPage}`
    );
    let data = await response.json();
    console.log(data);
    movies = data.results;
    totalPages = data.total_pages;
    totPage.innerHTML = totalPages + "&nbsp;&nbsp;&nbsp;";
    document.getElementById("totalPage1").innerHTML =
      totalPages + "&nbsp;&nbsp;&nbsp;";
    console.log(movies);
    console.log(totalPages);
    renderMovies(movies);
  } catch (error) {
    console.log(error);
  }
}

fetchMovies();

function navigateNext(params) {
  currentPage++;
  currPage.innerHTML = "&nbsp;&nbsp;&nbsp;" + currentPage;
  document.getElementById("currPage1").innerHTML = `Page&nbsp;${currentPage}`;
  if (searchInput.value.length > 0) {
    searchMovies();
  } else {
    // get the data and render on the ui
    fetchMovies();
  }
  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }
  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function navigatePrev(params) {
  currentPage--;
  currPage.innerHTML = "&nbsp;&nbsp;&nbsp;" + currentPage;
  document.getElementById("currPage1").innerHTML = `Page&nbsp;${currentPage}`;
  if (searchInput.value.length > 0) {
    searchMovies();
  } else {
    // get the data and render on the ui
    fetchMovies();
  }
  if (currentPage == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }
  if (currentPage >= totalPages) {
    nextBtn.disabled = true;
  } else {
    nextBtn.disabled = false;
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const prevBtn = document.getElementById("prev-button");
const nextBtn = document.getElementById("next-button");
const currPage = document.getElementById("currPage");
const totPage = document.getElementById("totalPage");

prevBtn.addEventListener("click", navigatePrev);
nextBtn.addEventListener("click", navigateNext);

totPage.addEventListener("click", () => {
  currentPage = 454;
  currPage.innerHTML = "&nbsp;&nbsp;&nbsp;" + currentPage;
  document.getElementById("currPage1").innerHTML = `Page&nbsp;${currentPage}`;
  fetchMovies();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// step 5
async function searchMovies() {
  const searchText = searchInput.value;

  const url = `https://api.themoviedb.org/3/search/movie?query=${searchText}&api_key=${APIKEY}&language=en-US&page=${currentPage}`;

  const resp = await fetch(url);
  const data = await resp.json();

  movies = data.results;
  totalPages = data.total_pages;
  totPage.innerHTML = totalPages + "&nbsp;&nbsp;&nbsp;";
  document.getElementById("currPage1").innerHTML = `Page&nbsp;${currentPage}`;
  document.getElementById("totalPage1").innerHTML = `&nbsp;${totalPages}`;

  renderMovies(movies);
}

const searchBtn = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");

searchBtn.addEventListener("click", searchMovies);

let sortByDateFlag = 0; // 0: ASC   // 1: DESC

// step 6
function sortByDate() {
  if (sortByDateFlag) {
    // desc

    movies.sort((m1, m2) => {
      return new Date(m2.release_date) - new Date(m1.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (oldest to latest)";
  } else {
    // asc

    movies.sort((m1, m2) => {
      return new Date(m1.release_date) - new Date(m2.release_date);
    });

    renderMovies(movies);

    sortByDateFlag = !sortByDateFlag;

    sortByDateBtn.innerText = "Sort by date (latest to oldest)";
  }
}

let sortByRatingFlag = 0; // 0: ASC   // 1: DESC
function sortByRating() {
  console.log(sortByRatingFlag);
  if (sortByRatingFlag) {
    // Desc
    movies.sort((m1, m2) => {
      return m2.vote_average - m1.vote_average;
    });

    console.log("Desc");
    console.log(movies);

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRatingBtn.innerText = "Sort by rating (lowest to highest)";
  } else {
    // Asc
    movies.sort((m1, m2) => {
      return m1.vote_average - m2.vote_average;
    });

    console.log("Asc!");
    console.log(movies);

    renderMovies(movies);

    sortByRatingFlag = !sortByRatingFlag;

    sortByRatingBtn.innerText = "Sort by rating (Highest to lowest)";
  }
}

const sortByDateBtn = document.getElementById("sort-by-date");
sortByDateBtn.addEventListener("click", sortByDate);

const sortByRatingBtn = document.getElementById("sort-by-rating");
sortByRatingBtn.addEventListener("click", sortByRating);

function renderFavMovies() {
  movieList.innerHTML = "";

  // get all my fav movies from localstorage
  const favMovies = getFavMoviesFromLocalStorage();

  // render this movies on to the ui

  favMovies.map((eFavMovie) => {
    let listItem = document.createElement("div");
    listItem.className = "movie-card";

    const { poster_path, title, vote_average, vote_count, release_date } =
      eFavMovie;

    const imageUrl = poster_path
      ? `https://image.tmdb.org/t/p/original${poster_path}`
      : "";

    let mInfo = {
      title,
      vote_count,
      vote_average,
      poster_path,
    };

    mInfo = JSON.stringify(mInfo);

    listItem.innerHTML = `<img
        src=${imageUrl}
        alt=${title}
        class="movie-image"
    />
    <div class="movie-details">
        <div class="movie-title">${title}</div>
        <div class="movie-heart" style="display: flex">
            <div class="movie-votes"><p>Votes: ${vote_count}</p><p>Rating: ${vote_average}</p><p>${release_date}</p></div>
            <i mInfo='${mInfo}' class="fa fa-heart vote" aria-hidden="true"></i>
        </div>
    </div>`;

    const favIconBtn = listItem.querySelector(".vote");

    favIconBtn.addEventListener("click", (event) => {
      let mInfo = JSON.parse(event.target.getAttribute("mInfo"));
      console.log(mInfo);
      // remove the movie from localstorage
      removeFavMoviesFromLocalStorage(mInfo);

      // remove the movie from the ui
      event.target.parentElement.parentElement.parentElement.remove();
    });

    movieList.appendChild(listItem);
  });
}

function displayMovies() {
  if (allTabsBtn.classList.contains("active-tab")) {
    renderMovies(movies);
    paginationContainer.style.display = "flex"; // Show pagination
  } else {
    renderFavMovies();
    paginationContainer.style.display = "none"; // Hide pagination
  }
}

function switchTabs(event) {
  allTabsBtn.classList.remove("active-tab"); // active-tab
  favTabsBtn.classList.remove("active-tab");

  event.target.classList.add("active-tab");

  displayMovies();
}

const allTabsBtn = document.getElementById("all-tab");
const favTabsBtn = document.getElementById("favorites-tab");
const paginationContainer = document.getElementById("paginationContainer");

allTabsBtn.addEventListener("click", switchTabs);
favTabsBtn.addEventListener("click", switchTabs);
