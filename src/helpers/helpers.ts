export const getDatesBetween = (startDate: string, endDate: string): string[] => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];

  for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const CART_EXPIRATION_MINUTES = 15;
export const getCartExpiration = (): Date => {
  return new Date(Date.now() + CART_EXPIRATION_MINUTES * 60 * 1000);
};

export const getTodayDateString = (): string => {
  const today = new Date();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(today);
};
