// src/composables/useTheme.js
const THEME_KEY = 'lms-theme'
const FALLBACK = 'light'

const THEMES = [
  { id: 'light',  name: 'Light' },
  { id: 'ocean',  name: 'Ocean' },
  { id: 'forest', name: 'Forest' },
  { id: 'grape',  name: 'Grape' },
]

function normalizeTheme(id) {
  const allowed = new Set(THEMES.map(t => t.id))
  return allowed.has(id) ? id : FALLBACK
}

export function getAvailableThemes() {
  return THEMES
}

export function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || FALLBACK
  } catch {
    return FALLBACK
  }
}

export function applyTheme(themeId) {
  const id = themeId || FALLBACK
  document.documentElement.setAttribute('data-theme', id)
}

export function setTheme(themeId) {
  try {
    localStorage.setItem(THEME_KEY, themeId)
  } catch {}
  applyTheme(themeId)
}
