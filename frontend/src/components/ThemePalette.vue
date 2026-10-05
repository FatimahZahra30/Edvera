<!-- src/components/ThemePalette.vue -->
<template>
  <div class="theme-palette">
    <div class="dropdown">
      <button
        class="btn dropdown-toggle theme-toggle-btn"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        title="Theme"
      >
        🎨
      </button>
      <ul class="dropdown-menu dropdown-menu-end shadow">
        <li class="px-3 py-2 text-muted small">Choose theme</li>
        <li><hr class="dropdown-divider" /></li>
        <li v-for="t in themes" :key="t.id">
          <button class="dropdown-item d-flex justify-content-between align-items-center"
                  @click="choose(t.id)">
            <span>{{ t.name }}</span>
            <span v-if="current === t.id" class="badge bg-primary">Active</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { getAvailableThemes, getSavedTheme, setTheme } from '../composables/useTheme'

export default {
  name: 'ThemePalette',
  data() {
    return {
      themes: getAvailableThemes(),
      current: getSavedTheme(),
    }
  },
  mounted() {
    // Ensure applied on mount (in case main.js missed)
    setTheme(this.current)
  },
  methods: {
    choose(id) {
      this.current = id
      setTheme(id)
    }
  }
}
</script>

<style scoped>
.theme-palette {
  position: fixed;
  top: 10px;
  right: 12px;
  z-index: 1050; /* above content */
}
.theme-toggle-btn {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0.25rem 0.5rem;
  font-size: 1.25rem; /* adjust size of 🎨 if needed */
}

.theme-toggle-btn::after {
  display: none !important; /* hides the default caret from dropdown-toggle */
}

.theme-toggle-btn:hover,
.theme-toggle-btn:focus {
  background: rgba(0, 0, 0, 0.05); /* optional subtle hover */
  border: none;
  box-shadow: none;
}

</style>
