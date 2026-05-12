function looksLikeSlug(value: string): boolean {
  return /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/.test(value.trim());
}

function looksLikeLowercaseWords(value: string): boolean {
  return /^[a-z0-9]+(?: [a-z0-9]+)+$/.test(value.trim());
}

function titleizeSlug(value: string): string {
  return value
    .trim()
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function titleizeWords(value: string): string {
  return value
    .trim()
    .split(/\s+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function normalizeSpecializationLabel(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (looksLikeSlug(trimmed)) {
    return titleizeSlug(trimmed);
  }

  if (looksLikeLowercaseWords(trimmed)) {
    return titleizeWords(trimmed);
  }

  return trimmed;
}

export function normalizeSpecializations(values: string[] | null | undefined): string[] {
  return (values ?? []).map(normalizeSpecializationLabel).filter(Boolean);
}
