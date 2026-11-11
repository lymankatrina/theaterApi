export const getSeats = async () => {
  const response = await fetch('/seats/');
  if (!response.ok) {
    throw new Error('Unable to get seats');
  }
  return response.json();
};
