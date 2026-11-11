export const getTicketsByShowtimeId = async (showtimeId) => {
  const response = await fetch(`/tickets?showtimeId=${encodeURIComponent(showtimeId)}`);
  if (!response.ok) {
    throw new Error('Unable to get tickets');
  }
  return response.json();
};
