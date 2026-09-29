export function formatAMD(amount: number): string {
  return `${amount.toLocaleString('hy-AM')} ֏`;
}

export function formatPhone(phone: string): string {
  return phone;
}

export function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function todayLabel(date: string, today: string): string {
  if (date === today) return 'Այսօր';
  const d = new Date(date);
  return d.toLocaleDateString('hy-AM', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function averageVisitValue(totalSpent: number, totalVisits: number): number {
  if (!totalVisits) return 0;
  return Math.round(totalSpent / totalVisits);
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
