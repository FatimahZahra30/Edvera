<template>
  <!-- Header bar (title + profile) -->
  <div class="header-bar d-flex justify-content-between align-items-center">
    <h2 class="page-title">{{ pageTitle }}</h2>

    <div class="profile">
      <i class="prof-icon bi bi-person-circle"></i>
      <div class="pill-info">
        <div><strong>{{ user.firstName }} {{ user.lastName }}</strong></div>
        <div style="font-size: 14px;">{{ user.email }}</div>
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
        <router-link to="/classrooms" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="mdi:google-classroom" width="24" height="24" class="nav-icon" /> <b>Classes</b>
        </router-link>
      </li>

      <li class="nav-item mb-1 left-align" v-if="userRole !== 'student'">
        <router-link to="/enrol" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="mdi:school" width="24" height="24" class="nav-icon" /> <b>Classroom Enrolment</b>
        </router-link>
      </li>

      <li class="nav-item mb-1">
        <router-link to="/courses" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="uil:book-open" width="24" height="24" class="nav-icon" /> <b>Courses</b>
        </router-link>
      </li>

      <li class="nav-item mb-1">
        <router-link to="/lessons" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="material-symbols:assignment-outline" width="24" height="24" class="nav-icon" /> <b>Lessons</b>
        </router-link>
      </li>

      <li class="nav-item mb-1" v-if="userRole !== 'student'">
        <router-link to="/reports" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="mdi:report-box-plus-outline" width="24" height="24" class="nav-icon" /> <b>Reports</b>
        </router-link>
      </li>

      <li class="nav-item mb-1" v-if="userRole === 'admin'">
        <router-link to="/system" class="nav-link d-flex align-items-center" active-class="active-link">
          <Icon icon="tdesign:system-setting-filled" width="24" height="24" class="nav-icon" /> <b>Systems</b>
        </router-link>
      </li>
    </ul>

    <!-- Footer -->
    <div class="mt-auto border-top pt-2 d-flex align-items-center">
      <ul class="nav nav-pills mb-auto">
        <li class="nav-item mb-1">
          <router-link to="/login" class="nav-link d-flex align-items-center">
            <Icon icon="material-symbols:logout-rounded" width="24" height="24" />
            <b>Log Out</b>
          </router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'

export default {
  name: "teacher-sidebar",
  components: { Icon },
  props: {
    pageTitle: {
      type: String,
      default: "Dashboard"
    },
  },
  data() {
    return {
      userRole: 'instructor',
      user: {},
    }
  },
  mounted() {
    // STORE THE CURRENT ROLE
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      this.user = user;
      this.userRole = user.role || 'instructor';
    }
  }
};

</script>

<style>
/* header divider uses theme border */
.header-line {
  position: absolute;
  top: 9rem;
  left: calc(250px + 1rem);
  right: 2rem;
  height: 1px;
  background-color: var(--border);
}

/* sidebar depends on theme */
.sidebar {
  position: fixed;
  top: 0; left: 0;
  height: 100vh; width: 250px;
  padding: 1rem;
  border-right: 1px solid var(--border);
  background-color: var(--sidebar-bg);
  color: var(--sidebar-fg);
}

.nav-link { margin-left: 1rem; gap: .75rem; color: var(--sidebar-fg) !important; }
.nav-link .nav-icon { width: 24px; height: 24px; }
.nav-link:hover { background-color: rgba(255,255,255,.08); color: var(--sidebar-fg) !important; }

/* profile pill uses card vars so it also themes */
.profile {
  display: flex; align-items: center;
  background: var(--bs-card-bg);
  color: var(--bs-card-color);
  border-radius: 999px;
  padding: .5rem .75rem;
}
.prof-icon { font-size: 1.75rem; color: #AAADBD; }
.pill-info { margin-left: .5rem; line-height: 1.1; }

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
