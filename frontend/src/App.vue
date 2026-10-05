<template>
  <div id="app">
    <router-view />
    <!-- 🎨 Theme palette button (only visible when logged in) -->
    <ThemePalette v-if="isLoggedIn" />
  </div>
</template>

<script>
import ThemePalette from './components/ThemePalette.vue'

export default {
  components: { ThemePalette },
  computed: {
    isLoggedIn() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || 'null')
        return !!user
      } catch {
        return false
      }
    }
  }
}
</script>

<style>
/* Optional global styles */
body {
  margin: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
</style>
