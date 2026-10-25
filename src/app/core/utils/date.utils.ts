/**
 * Formats a Date object into a local 'YYYY-MM-DDTHH:mm:ss' string compatible
 * with both HTML datetime-local (step=1) and backend Spring Boot LocalDateTime.
 */
export function formatToApiDateTime(date: Date = new Date()): string {
  const pad = (n: number): string => n.toString().padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Normalizes user input datetime string to ensure standard 'YYYY-MM-DDTHH:mm:ss' format.
 * If seconds are missing (e.g. 'YYYY-MM-DDTHH:mm'), ':00' is appended.
 */
export function ensureApiDateTime(value: string): string {
  if (!value) {
    return '';
  }

  // Already YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  // YYYY-MM-DDTHH:mm without seconds
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }

  // If parsed as Date
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) {
    return formatToApiDateTime(parsed);
  }

  return value;
}
