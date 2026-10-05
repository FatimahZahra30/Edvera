<template>
  <div>
    <teacher-sidebar v-if="role === 'teacher'" />
    <student-sidebar v-else-if="role === 'student'" />
    <div v-else class="p-3">
      <p>No role found. <a @click.prevent="goLogin" href="#">Go to login</a></p>
    </div>
  </div>
</template>

<script>
import TeacherSidebar from '../components/teacher-sidebar.vue'
import StudentSidebar from '../components/student-sidebar.vue'

export default {
  name: 'dashboard',
  components: { TeacherSidebar, StudentSidebar },
  data() {
    return { role: 'teacher' }
  },
  created() {
    this.role = localStorage.getItem('userRole') || 'teacher';
  },
  methods: {
    goLogin() {
      this.$router.push('/login');
    }
  }
}
</script>
