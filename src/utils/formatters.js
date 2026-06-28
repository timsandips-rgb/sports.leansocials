import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';

export function formatDate(date, fmt = 'MMM dd, yyyy') {
  if (!date) return '-';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return format(d, fmt);
}

export function formatDateTime(date, fmt = 'MMM dd, yyyy HH:mm') {
  return formatDate(date, fmt);
}

export function formatTimeAgo(date) {
  if (!date) return '-';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return formatDistanceToNow(d, { addSuffix: true });
}

export function isDeadlinePassed(deadline) {
  if (!deadline) return false;
  const d = deadline?.toDate ? deadline.toDate() : new Date(deadline);
  return isBefore(d, new Date());
}

export function getTimeRemaining(deadline) {
  if (!deadline) return null;
  const d = deadline?.toDate ? deadline.toDate() : new Date(deadline);
  const total = d - new Date();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }
  return {
    total,
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / 1000 / 60) % 60),
    seconds: Math.floor((total / 1000) % 60),
    expired: false,
  };
}

export function formatPoints(points) {
  return `${points} pt${points === 1 ? '' : 's'}`;
}
