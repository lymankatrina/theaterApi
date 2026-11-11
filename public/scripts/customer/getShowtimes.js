import { getMovieById } from '../api/movies.api.js';
import { getShowtimesByMovieId } from '../api/showtimes.api.js';
import { formatDate } from '../shared/dateUtils.js';

const getMovieId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('movieId');
};

const displayMovie = (movie) => {
  const showtimeInfoContainer = document.getElementById('showtimeInfoContainer');

  const movieTitle = document.createElement('h2');
  movieTitle.textContent = movie.title;

  const moviePoster = document.createElement('img');
  moviePoster.src = movie.poster;
  moviePoster.alt = `${movie.title} poster`;

  showtimeInfoContainer.appendChild(movieTitle);
  showtimeInfoContainer.appendChild(moviePoster);
};

const displayShowtimes = (showtimes) => {
  const showtimeInfoContainer = document.getElementById('showtimeInfoContainer');

  const showtimesHeading = document.createElement('h3');
  showtimesHeading.textContent = 'Available Showtimes';

  showtimeInfoContainer.appendChild(showtimesHeading);

  showtimes.forEach((showtime) => {
    const showtimeButton = document.createElement('button');
    showtimeButton.classList.add('showtime-button');

    showtimeButton.textContent = `${formatDate(showtime.date)} | ${showtime.time}`;

    showtimeButton.addEventListener('click', () => {
      window.location.href = `/pages/tickets.html?showtimeId=${encodeURIComponent(showtime._id)}`;
    });

    showtimeInfoContainer.appendChild(showtimeButton);
  });
};

const loadShowtimesPage = async () => {
  const movieId = getMovieId();

  if (!movieId) {
    document.getElementById('showtimeInfoContainer').textContent = 'Invalid movie selection.';
    return;
  }

  try {
    const movie = await getMovieById(movieId);
    const showtimes = await getShowtimesByMovieId(movieId);

    displayMovie(movie);
    displayShowtimes(showtimes);
  } catch (error) {
    console.error('Error loading movie:', error);

    document.getElementById('showtimeInfoContainer').textContent = 'Unable to load movie information.';
  }
};

document.addEventListener('DOMContentLoaded', loadShowtimesPage);
