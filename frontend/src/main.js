// import { createApp } from 'vue'
// import './style.css'
// import App from './App.vue'
// import router from './router'
// import './assets/styles/main.css'

// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'

// // // Get user data from localStorage
// // const user = JSON.parse(localStorage.getItem("user"));
// // const userEmail = user ? user.email : null;

// // // Make it globally accessible
// // app.config.globalProperties.$userEmail = userEmail;

// createApp(App).use(router).mount('#app')

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// 🎨 Theme system imports
import './assets/themes.css'
import { getSavedTheme, applyTheme } from './composables/useTheme'
// main.js
import 'bootstrap/dist/js/bootstrap.bundle.min.js'   // ← ADD THIS

// ✅ Apply the last selected theme before the app mounts
applyTheme(getSavedTheme())

// ✅ Create app
const app = createApp(App)

// ✅ Make admin email globally accessible
app.config.globalProperties.$ADMIN_EMAIL = "chongchunyuan@gmail.com"

// ✅ Use router and mount
app.use(router).mount('#app')
 