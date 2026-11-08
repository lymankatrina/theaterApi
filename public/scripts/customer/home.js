import { getNowPlaying, getComingSoon } from '../api/showtimes.api.js';
import { getCurrentEvents } from '../api/events.api.js';

import { createMovieCard } from '../components/movieCard.js';
import { createEventCard } from '../components/eventCard.js';

import { formatDate } from '../shared/dateUtils.js';

const displayCurrentEvents = async () => {
  const eventsContainer = document.getElementById('currentPublicEventsContainer');
  const eventsMessage = document.getElementById('currentPublicEventsMessage');

  try {
    const events = await getCurrentEvents();
    eventsContainer.innerHTML = '';
    eventsMessage.textContent = '';

    if (events.length === 0) {
      eventsMessage.textContent = 'There are no special events scheduled at this time.';
      return;
    }

    const heading = document.createElement('h2');
    heading.textContent = 'Current Events';
    eventsContainer.appendChild(heading);

    events.forEach((event) => {
      const eventCard = createEventCard(event);
      eventsContainer.appendChild(eventCard);
    });
  } catch (error) {
    console.error('Error displaying current events:', error);
  }
};

const displayNowPlaying = async () => {
  const nowPlayingContainer = document.getElementById('nowPlayingContainer');
  try {
    const nowPlaying = await getNowPlaying();

    nowPlayingContainer.innerHTML = '';

    nowPlaying.forEach((item) => {
      const movieCard = createMovieCard(item.movie);
      nowPlayingContainer.appendChild(movieCard);
    });
  } catch (error) {
    console.error('Error displaying now playing movies:', error);
  }
};

const displayComingSoon = async () => {
  const comingSoonContainer = document.getElementById('comingSoonContainer');
  try {
    const comingSoon = await getComingSoon();

    comingSoonContainer.innerHTML = '';

    comingSoon.forEach((item) => {
      const movieCard = createMovieCard(item.movie);
      const showtimeDates = document.createElement('p');
      showtimeDates.classList.add('coming-soon-dates');
      showtimeDates.textContent = `Playing ${formatDate(item.firstShowtimeDate)} - ${formatDate(item.lastShowtimeDate)}`;
      const movieTitle = movieCard.querySelector('.movie-title');
      movieTitle.insertAdjacentElement('afterend', showtimeDates);
      comingSoonContainer.appendChild(movieCard);
    });
  } catch (error) {
    console.error('Error displaying coming soon movies:', error);
  }
};

displayCurrentEvents();
displayNowPlaying();
displayComingSoon();
