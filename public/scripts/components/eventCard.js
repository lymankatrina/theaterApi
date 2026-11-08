import { formatDate } from '../shared/dateUtils.js';

export const createEventCard = (event) => {
  const eventCard = document.createElement('article');
  eventCard.classList.add('current-public-event-banner');

  const eventContent = document.createElement('div');
  eventContent.classList.add('event-content');

  const imageContainer = document.createElement('div');
  imageContainer.classList.add('event-image-container');

  const image = document.createElement('img');
  image.classList.add('event-image');
  image.src = event.image;
  image.alt = event.title;

  imageContainer.appendChild(image);
  eventContent.appendChild(imageContainer);

  const eventDetails = document.createElement('div');
  eventDetails.classList.add('event-details');

  const eventHeader = document.createElement('div');
  eventHeader.classList.add('event-header');

  const title = document.createElement('h3');
  title.classList.add('event-title');
  title.textContent = event.title;

  const tagline = document.createElement('h4');
  tagline.classList.add('event-tagline');
  tagline.textContent = event.tagline;

  eventHeader.appendChild(title);
  eventHeader.appendChild(tagline);

  eventDetails.appendChild(eventHeader);

  const eventBody = document.createElement('div');
  eventBody.classList.add('event-body');

  const description = document.createElement('p');
  description.classList.add('event-description');
  description.textContent = event.description;

  const dates = document.createElement('p');
  dates.classList.add('event-dates');
  if (event.startDate === event.endDate) {
    dates.textContent = `Date: ${formatDate(event.startDate)}`;
  } else {
    dates.textContent = `Dates: ${formatDate(event.startDate)} - ${formatDate(event.endDate)}`;
  }

  const time = document.createElement('p');
  time.classList.add('event-time');
  time.textContent = `Time: ${event.startTime} - ${event.endTime}`;

  eventBody.appendChild(description);
  eventBody.appendChild(dates);
  eventBody.appendChild(time);

  eventDetails.appendChild(eventBody);

  if (event.link) {
    const eventFooter = document.createElement('div');
    eventFooter.classList.add('event-footer');

    const moreDetails = document.createElement('a');
    moreDetails.classList.add('event-read-more');
    moreDetails.href = event.link;
    moreDetails.target = '_blank';
    moreDetails.rel = 'noopener noreferrer';
    moreDetails.textContent = 'More Details';

    eventFooter.appendChild(moreDetails);
    eventDetails.appendChild(eventFooter);
  }
  eventContent.appendChild(eventDetails);
  eventCard.appendChild(eventContent);

  return eventCard;
};
