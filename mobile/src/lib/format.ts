import { User } from '@/src/types';

/** "350 m", "1.2 km", "18 km" */
export function formatDistance(meters?: number | null): string | null {
  if (meters == null || !Number.isFinite(meters)) return null;
  if (meters < 950) return `${Math.max(10, Math.round(meters / 10) * 10)} m`;
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${String(Math.round(km)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} km`;
}

/** "21 Nov 2026" */
export function formatDate(iso?: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function firstName(user?: Pick<User, 'firstName' | 'email'> | null): string {
  if (!user) return 'A friend';
  return user.firstName?.trim() || user.email.split('@')[0];
}

/** "Mert's pick", "James' pick" */
export function possessive(name: string): string {
  return /s$/i.test(name) ? `${name}'` : `${name}'s`;
}

export function plural(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "Ayşe", "Ayşe and Mert", "Ayşe, Mert and 2 others" */
export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} and ${names[2]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others`;
}
