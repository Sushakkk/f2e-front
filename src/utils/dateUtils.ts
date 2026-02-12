export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function fromIsoDate(value: string): Date | null {
  if (!value) return null;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!m) return null;

  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);

  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;

  return d;
}

export function formatRu(value: string): string {
  const d = fromIsoDate(value);

  if (!d) return '';

  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, delta: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function clampRange(
  from: Date | null,
  to: Date | null,
): { from: Date | null; to: Date | null } {
  if (!from || !to) return { from, to };
  if (to < from) return { from: to, to: from };

  return { from, to };
}
