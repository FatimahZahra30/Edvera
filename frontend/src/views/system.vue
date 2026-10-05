<template>
  <div class="layout">
    <aside class="sidebar">
      <TeacherSidebar page-title="Systems" />
    </aside>

    <main class="content">
      <div class="content-pad">
        <div class="tab-wrapper reports-tab-wrapper">
          <!-- Tab Headers -->
          <ul class="tab-header" role="tablist">
            <li
              v-for="(tab, index) in tabs"
              :key="tab.title"
              :class="{ 'tab-selected': selectedIndex === index }"
              @click="selectTab(index)"
              role="tab"
              :aria-selected="selectedIndex === index"
            >
              {{ tab.title }}
            </li>
          </ul>

          <!-- Tab Content: render only the active tab for performance -->
          <div class="tab-content" role="tabpanel">
            <!-- Classrooms -->
            <section v-if="selectedIndex === 0">
              <div v-if="students.length" class="user-list">
                <ul>
                  <li
                    v-for="student in students"
                    :key="student._id"
                    class="student-row"
                  >
                    <div class="user-details">
                      <h5>{{ student.firstName }} {{ student.lastName }}</h5>
                      <div>Email: {{ student.email }}</div>
                    </div>
                    <button
                      class="btn btn-danger btn-sm mt-1"
                      @click="openDeleteModal(student, 'student')"
                    >
                      Remove
                    </button>
                  </li>
                </ul>
              </div>
              <p v-else>No students found.</p>
            </section>

            <!-- Courses -->
            <section v-if="selectedIndex === 1">
              <div v-if="instructors.length" class="user-list">
                <ul>
                  <li
                    v-for="instructor in instructors"
                    :key="instructor._id"
                    class="instructor-row"
                  >
                    <div class="user-details">
                      <h5>{{ instructor.firstName }} {{ instructor.lastName }}</h5>
                      <div>Email: {{ instructor.email }}</div>
                    </div>
                    <button
                      class="btn btn-danger btn-sm mt-1"
                      @click="openDeleteModal(instructor, 'instructor')"
                    >
                      Remove
                    </button>
                  </li>
                </ul>
              </div>
              <p v-else>No instructors found.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>

  <SystemDeleteModal
    :user-to-delete="selectedUser"
    :user-type="selectedType"
    @delete-user="handleDelete"
  />
</template>

<script>
import { Modal } from "bootstrap";
import TeacherSidebar from "../components/teacher-sidebar.vue";
import SystemDeleteModal from "../components/system-delete-modal.vue";
import { getStudents, getSupervisors, deleteUser } from "../api";

export default {
  name: "System",
  components: { TeacherSidebar, SystemDeleteModal },

  data() {
    return {
      tabs: [{ title: "Students" }, { title: "Instructors" }],
      selectedIndex: 0,
      students: [],
      instructors: [],
      selectedUser: null,
      selectedType: null,
    };
  },

  async mounted() {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "admin") {
      alert("Access denied - admin only");
      this.$router.push("/");
      return;
    }

    try {
      const [studentsRes, instructorsRes] = await Promise.all([
        getStudents(),
        getSupervisors(),
      ]);
      const myEmail = user?.email || "";
      this.students = (studentsRes.data || []).filter(s => s.role === "student");
      this.instructors = (instructorsRes.data || []).filter(
        i=>i.role === "teacher" && i.email !== myEmail
      );
    } catch (err) {
      console.error("Failed to fetch users:", err);
      alert("Error fetching users.");
    }
  },

  methods: {
    selectTab(i) {
      this.selectedIndex = i;
    },

    openDeleteModal(user, type) {
      this.selectedUser = { ...user };
      this.selectedType = type;
      this.$nextTick(() => {
        Modal.getOrCreateInstance("#delete-user").show();
      });
    },

    async handleDelete(user) {
      if (!user?._id) return alert("Invalid user.");
      try {
        await deleteUser(user._id);
        if (this.selectedType === "student") {
          this.students = this.students.filter((s) => s._id !== user._id);
        } else {
          this.instructors = this.instructors.filter((i) => i._id !== user._id);
        }
        Modal.getInstance("#delete-user")?.hide();
        alert(`${this.selectedType} removed successfully.`);
      } catch (err) {
        console.error("Error removing user:", err);
        alert("Failed to remove user.");
      }
    },
  },
};
</script>


<style scoped>
.layout {
  --sidebar-w: 250px;
  --header-h: 90px;
  --content-pad-x: 1rem;
  --bg: #e3ebff;
  --border: #8895a2;
  background: var(--bg);
  min-height: 100vh;
}

.tab-wrapper {
  width: 100%;
  max-width: 1120px;
}

.tab-header {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  border-bottom: 2px solid #ccc;
}

.tab-header li {
  cursor: pointer;
  background: #fff;
  margin-right: 5px;
  transition: background 0.2s;
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.tab-header li:hover {
  background: #eee;
}

.tab-header li.tab-selected {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.tab-content {
  border: 1px solid #ccc;
  border-top: none;
  padding: 20px;
  min-height: 450px;
  background: #fff;
  box-sizing: border-box;
  text-align: left;
}

.tab-content p {
  margin-top: 1rem;
}

.user-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  background: #f9f9f9;
  margin-top: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #f9f9f9;
}

.user-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list h5 {
  margin: 0 0 0.25rem 0;
}

.user-details {
  margin-left: 1rem;
  font-size: 0.95rem;
  color: #333;
}

.user-list li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.user-list li:last-child {
  border-bottom: none;
}

.student-row,
.instructor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.student-row button,
.instructor-row button {
    margin-right: 20px;
    background-color: #007bff;
    border-color: #007bff;
}

.student-row button:active,
.instructor-row button:active {
    background-color: #2E32A3;
    border-color: #2E32A3;
}

.user-details {
  display: flex;
  flex-direction: column;
}
</style>
