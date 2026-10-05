<template>
    <!-- Profile section -->
    <div class="profile-container">
        <div class="profile">
            <i class="prof-icon bi bi-person-circle"></i>
            <div class="info">
                <h5>Name</h5>
                <h6>name@gmail.com</h6>
            </div>
        </div>
    </div>

    <!-- Header Line -->
    <div class="header-line"></div>
    

  <!-- Sidebar -->
  <div class="sidebar d-flex flex-column">
    <!-- Sidebar Header -->
    <div class="mb-4 pb-2">
      <img src="../assets/logo.png" alt="Logo" class="sidebar-logo" />
    </div>

    <!-- Navigation -->
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item mb-1">
        <router-link to="/dashboard" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="radix-icons:dashboard" width="24" height="24" /> <b>Dashboard</b>
        </router-link>
      </li>

      <li class="nav-item mb-1">
        <router-link to="/classrooms" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="mdi:google-classroom" width="24" height="24" /> <b>Classes</b>
        </router-link>
      </li>

      <li class="nav-item mb-1">
        <router-link to="/courses" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="uil:book-open" width="24" height="24" />
            <b>Courses</b>
        </router-link>
      </li>

      <li class="nav-item mb-1" >
        <router-link to="/student-lessons" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="material-symbols:assignment-outline" width="24" height="24" /> <b>Lessons</b>
        </router-link>
      </li>
    </ul>

    <!-- Footer -->
    <div class="mt-auto border-top pt-2 d-flex align-items-center">
        <ul class="nav nav-pills mb-auto">
            <li class="nav-item mb-1">
        <a href="#" class="nav-link d-flex align-items-center">
          <Icon icon="material-symbols:logout-rounded" width="24" height="24" />
            <b>Log Out</b>
        </a>
    </li>
        </ul>
    </div>
  </div>
</template>

/* student-sidebar.vue */
<style>
/* ❌ remove the hardcoded page background */
 /* body { background-color: #E3EBFF !important; } */

/* use theme vars for the divider */
.header-line {
  position: absolute;
  top: 9rem;
  left: calc(250px + 1rem);
  right: 2rem;
  height: 1px;
  background-color: var(--border);
}

/* profile pill reads the card + text colors from theme */
.profile {
  height: 60px;
  width: 350px;
  background-color: var(--bs-card-bg);
  color: var(--bs-card-color);
  border-radius: 35px;
  display: flex;
  align-items: center;
  padding: 9px;
}

.prof-icon { font-size: 3rem; color: #AAADBD; }
img { width: 12rem; height: auto; }
.profile-container { position: absolute; top: 1.5rem; right: 1.5rem; }

/* sidebar now follows theme */
.sidebar {
  position: fixed;
  top: 0; left: 0;
  height: 100vh; width: 250px;
  padding: 1rem;
  border-right: 1px solid var(--border);
  background-color: var(--sidebar-bg);
  color: var(--sidebar-fg);
}

/* nav links use sidebar foreground color */
.sidebar > .nav:first-of-type { margin-top: 2rem; }
.nav-link { margin-left: 1rem; gap: .75rem; color: var(--sidebar-fg) !important; }
.nav-link b { font-size: 1.1rem; }
.nav-link .iconify { width: 28px !important; height: 28px !important; }

/* subtle hover using the same color space */
.nav-link:hover {
  background-color: rgba(255,255,255,.08);
  color: var(--sidebar-fg) !important;
}

.info { display: flex; flex-direction: column; margin-left: .75rem; line-height: 1.2; }
.info h5, .info h6 { margin: 0; padding: 0; text-align: left; }
.info h5 { font-weight: 600; }

/* Themed header bar */
.header-bar {
  position: fixed;
  top: 0;
  left: 250px;                 /* match your sidebar width */
  right: 0;
  height: 60px;                /* match your header height */
  display: flex;
  align-items: center;
  justify-content: space-between;

  background: var(--bs-card-bg);   /* ← theme-driven */
  color: var(--bs-card-color);     /* ← theme-driven */
  border-bottom: 1px solid var(--border);
  z-index: 100;
  padding: 0 1.25rem;              /* optional: same as content pad */
}

.page-title { 
  margin: 0;
  color: var(--bs-card-color);     /* ensure title follows theme */
}
</style>

<script>
import { Icon } from '@iconify/vue'

export default {
  name: "student-sidebar",
  components: {
    Icon
  }
};
</script>