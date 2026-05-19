export type AppTheme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'five-to-eight-theme';
const DEFAULT_THEME: AppTheme = 'dark';

export function getStoredTheme(): AppTheme {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  const value = window.localStorage.getItem(THEME_STORAGE_KEY);

  return value === 'light' || value === 'dark' ? value : DEFAULT_THEME;
}

export function applyTheme(theme: AppTheme): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function setTheme(theme: AppTheme): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent<AppTheme>('app-theme-change', { detail: theme }));
  }

  applyTheme(theme);
}

export function initTheme(): AppTheme {
  const theme = getStoredTheme();

  applyTheme(theme);

  return theme;
}
