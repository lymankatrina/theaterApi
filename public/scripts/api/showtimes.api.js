export const getNowPlaying = async () => {
  const response = await fetch('/showtimes/now-playing');

  if (!response.ok) {
    throw new Error('Unable to get now playing movies');
  }

  return response.json();
};

export const getComingSoon = async () => {
  const response = await fetch('/showtimes/coming-soon');

  if (!response.ok) {
    throw new Error('Unable to get coming soon movies');
  }

  return response.json();
};
