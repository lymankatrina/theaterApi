export const getCurrentEvents = async () => {
  const response = await fetch('/events');

  if (!response.ok) {
    throw new Error('Unable to get current events');
  }
  return response.json();
};
