export const getMovies = async () => {
  const response = await fetch('/movies');
  if (!response.ok) {
    throw new Error('Unable to get movies');
  }
  return response.json();
};

export const getMovieById = async () => {
  const response = await fetch(`/movies/${movieId}`);
  if (!response.ok) {
    throw new Error('Unable to get movie');
  }
  return response.json();
};
