export function parseSchedule(schedule?: string | null): Date | null {
  if (!schedule) return null;
  let normalized = schedule.trim();
  if (!normalized) return null;
  if (!normalized.endsWith('Z') && !normalized.includes('+')) {
    const segments = normalized.split(':');
    if (segments.length >= 3) {
      normalized = `${normalized}Z`;
    } else {
      normalized = `${normalized}:00Z`;
    }
  }
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid schedule time provided.');
  }
  return date;
}

export function formatReadable(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}
