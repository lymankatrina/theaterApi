export const validDateString = (
  value: string
): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(
      'Date must be in YYYY-MM-DD format'
    );
  }
  const date = new Date(
    `${value}T00:00:00Z`
  );
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0,10) !== value
  ) {
    throw new Error(
      'Date must be a valid calendar date'
    );
  }
  return true;
};
