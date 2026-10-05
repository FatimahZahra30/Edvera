<template>
  <div class="layout">
    <!-- Fixed Sidebar -->
    <aside class="sidebar">
      <TeacherSidebar page-title="Enrolment"/>
    </aside>

    <!-- Scrollable Content -->
    <main class="content">
      <section class="split-section">
        <div class="left-half col">
          <h3>Classrooms</h3>
          <div class="scrollable-left">
            <div 
              v-for="room in classroom" 
              :key="room" 
              class="list-item"
            >
              <div v-if="new Date(room.startDate) > now" class="enrol-item-class" @click="updateRoom(room)" style="cursor: pointer" :style="{ backgroundColor: (room === selectedClassroom) ? 'rgba(135,206,235,0.4)' : 'white' }">
                <h3 class="item-title" style="user-select: none; margin-bottom: 3px">{{ room.name }}</h3>
                <p style="margin-bottom: 0px; user-select: none;">ID: {{ room.classroomID }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="right-half">
          <div class="scrollable-right">
            <div class="d-flex justify-content-center">
              <div class="d-flex flex-row align-items-center" style="margin-bottom: 10px">
                <h3 class="mb-0">Enrol Students</h3>
                <button class="btn btn-primary btn-sm ms-3" @click="updateEnrol" :disabled="!enrolledStudents.length">Submit</button>
              </div>
            </div>
            <div v-for="student in courseStudents" :key="student._id" class="form-check enrol-item text-start" @click="console.log(student)">
              <input class="form-check-input" type="checkbox" :id="student._id" :value="student" v-model="enrolledStudents" style="margin-left: 0px;"/>
              <label class="form-check-label" :for="student._id" style="margin-left: 20px;">
                {{ student.firstName }} {{ student.lastName }} ({{ student.email }})
              </label>
            </div>
            <div v-if="!courseStudents.length" class="small text-muted" style="margin-top:10px">No more students to enrol.</div>
          </div>
        </div>
      </section>
    </main>
  </div> 
</template>

<script>
import { Icon } from '@iconify/vue'
import TeacherSidebar from '../components/teacher-sidebar.vue'
import { getCourseStudents, getAllClassrooms, enrolStudents } from "../api";

export default {
  name: "Lesson",
  components: { Icon, TeacherSidebar },
  data() {
    return {
      // list of classrooms from API
      classroom: [],
      // currently selected classroom (object)
      selectedClassroom: null,
      courseId: null, // associated course's id of selected Classroom
      classroomId: null,
      // students not yet enrolled (or enrolled list depending on your naming)
      courseStudents: [],
      enrolledStudents: [],
      user: '', // email
    };
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) this.user = user.email;
    this.userRole = user.role;
    const email = user.email;
    this.now = new Date();
    console.log("NOW:", this.now)
    console.log("Current user:", email);
    console.log("Current role:", this.userRole)
    try {
      const res = await getAllClassrooms({supervisor: email, userRole: this.userRole}); // Just pass email directly
      const payload = res?.data?.data ?? res?.data ?? res;
      console.log("mounted - classrooms payload:", payload);
      this.classroom = Array.isArray(payload) ? payload : (payload?.data ?? payload?.rows ?? []);
    } catch (err) {
      console.error("Failed to fetch classrooms", err);
    }
  },
  methods: {
    async updateEnrol() {
      try {
        // Construct request body
        let classroomId =  this.classroomId;
        let students = this.enrolledStudents.map(student => student._id);

        // Make POST (or PUT) request to backend
        const res = await enrolStudents({ action: "enrol", classroomId, students })
        window.location.reload(true);
        // Success handling
        console.log("✅ Enrolment updated:", res.data);
        alert("Students successfully enrolled!");

      } catch (err) {
        console.error("❌ Failed to update enrolment:", err);
        alert("Error updating enrolment: " + (err.response?.data?.error || err.message));
      }
    },
    /**
     * selection: the classroom object the user chose
     */
    async updateRoom(selection) {
      if (!selection) return;
      this.selectedClassroom = selection;
      console.log("Starting to fetch students for classroom:", selection);

      const courseId = selection?.associatedCourse?.[0];
      console.log("Obtained course ID:", courseId, "length", courseId?.length);
      this.courseId = courseId;
      const classroomId = selection?._id;
      this.classroomId = classroomId;
      console.log("Classroom ID:", classroomId);

      try {
        let res;
        if (courseId) {
          console.log("Trying to get with course ID");
          res = await getCourseStudents({ action: "course", courseId, classroomId });
        } else {
          res = await getCourseStudents({ classroom: selection });
        }

        const students = res.data;
        console.log("Received students payload:", students.students);
        this.courseStudents = students.students

      } catch (err) {
        console.error("Failed to get students");
        console.error("Error response:", err.response?.data);
        console.error("Error status:", err.response?.status);
        console.error("Full error:", err);
      }
}}};
</script>
