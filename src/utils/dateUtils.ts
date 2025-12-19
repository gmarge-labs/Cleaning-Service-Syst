/**
 * Formats a Date object to YYYY-MM-DD string, preserving the local date.
 */
export const formatDateForDB = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parses a date string (ISO or YYYY-MM-DD) into a Date object at midnight local time.
 * This avoids timezone shifts when reading dates from the database.
 */
export const parseDateFromDB = (dateStr: string | Date): Date => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;

  const [datePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Formats a date string or object for display.
 */
export const formatDisplayDate = (date: string | Date): string => {
  const d = parseDateFromDB(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};
