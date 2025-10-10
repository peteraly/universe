export const TIMEFRAMES = ['Today', 'Tomorrow', 'This Week', 'This Month'];

export const clampHour = (h) => Math.min(24, Math.max(5, h));

export const hourLabel = (h) => {
  const hr = ((h + 11) % 12) + 1; // Convert to 1-12 format
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hr}:00 ${ampm}`;
};

export const formatTime = (hour) => {
  if (hour === 24) return '12:00 AM';
  if (hour === 12) return '12:00 PM';
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

export const formatDistance = (distance) => {
  if (distance < 1) return `${Math.round(distance * 10) / 10} mi`;
  return `${Math.round(distance * 10) / 10} mi`;
};

export const formatEventTime = (date, time) => {
  const eventDate = new Date(date);
  const now = new Date();
  const diffTime = eventDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return 'This Week';
  return 'This Month';
};
