export const createMovieCard = (movie) => {
  const movieCard = document.createElement('article');
  movieCard.classList.add('now-playing-movie-banner');

  const posterContainer = document.createElement('div');
  posterContainer.classList.add('poster-container');

  const poster = document.createElement('img');
  poster.src = movie.poster;
  poster.alt = `${movie.title} poster`;
  poster.classList.add('movie-poster');

  const trailerContainer = document.createElement('div');
  trailerContainer.classList.add('movie-trailer-container');

  const trailer = document.createElement('iframe');
  trailer.classList.add('movie-trailer');
  trailer.src = movie.trailer;
  trailer.title = `${movie.title} trailer`;
  trailer.allowFullscreen = true;
  trailer.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

  posterContainer.appendChild(poster);

  trailerContainer.appendChild(trailer);
  posterContainer.appendChild(trailerContainer);

  movieCard.appendChild(posterContainer);

  const movieInfo = document.createElement('div');
  movieInfo.classList.add('movie-info');

  const movieTitle = document.createElement('h2');
  movieTitle.classList.add('movie-title');
  movieTitle.textContent = movie.title;

  movieInfo.appendChild(movieTitle);

  const movieTagline = document.createElement('h3');
  movieTagline.classList.add('movie-tagline');
  movieTagline.textContent = movie.tagLine;

  movieInfo.appendChild(movieTagline);

  const movieRating = document.createElement('p');
  movieRating.classList.add('movie-rating');
  movieRating.textContent = `Rating: ${movie.certification} | Length: ${movie.runtime}`;

  movieInfo.appendChild(movieRating);

  const movieGenres = document.createElement('p');
  movieGenres.classList.add('movie-genres');
  movieGenres.textContent = movie.genres;

  movieInfo.appendChild(movieGenres);

  const scores = [];
  if (movie.imdbScore !== undefined) {
    scores.push(`IMDB: ${movie.imdbScore}`);
  }

  if (movie.fandangoAudienceScore) {
    scores.push(`Fandango: ${movie.fandangoAudienceScore}`);
  }

  if (movie.rottenTomatoes) {
    scores.push(`Rotten Tomatoes: ${movie.rottenTomatoes}`);
  }

  if (scores.length > 0) {
    const movieScores = document.createElement('p');
    movieScores.classList.add('movie-scores');
    movieScores.textContent = scores.join(' | ');

    movieInfo.appendChild(movieScores);
  }

  const movieOverview = document.createElement('p');
  movieOverview.classList.add('movie-overview');
  movieOverview.textContent = movie.overview;

  movieInfo.appendChild(movieOverview);

  const showtimesButton = document.createElement('button');
  showtimesButton.classList.add('view-showtimes-button');
  showtimesButton.textContent = 'View Showtimes & Get Tickets';
  showtimesButton.addEventListener('click', () => {
    window.location.href = `/pages/getShowtimes.html?movieId=${encodeURIComponent(movie._id)}`;
  });

  movieInfo.appendChild(showtimesButton);

  movieCard.appendChild(movieInfo);

  return movieCard;
};
