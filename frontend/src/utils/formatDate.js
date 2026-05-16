export function formatDate(dateString) {
  if (!dateString) return '—';

  const date = new Date(dateString);
  const now = new Date();
  const diff = date - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });

  if (days < 0 && days > -7) return `${formatted} (${Math.abs(days)}d ago)`;
  if (days === 0) return `${formatted} (today)`;
  if (days === 1) return `${formatted} (tomorrow)`;
  if (days > 1 && days <= 7) return `${formatted} (in ${days}d)`;

  return formatted;
}

export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'done') return false;
  return new Date(dueDate) < new Date();
}
