<template>
  <div class="layout">
    <!-- Fixed Sidebar -->
    <aside class="sidebar">
      <TeacherSidebar page-title="Courses"/>
    </aside>

    <!-- Scrollable Content -->
    <main class="content">
      <div class="content-pad" >
        <!-- Header -->
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
          <!-- Toolbar -->
          <form class="row g-2" @submit.prevent>
            <!-- New Course -->
            <div class="col-12 col-md-auto">
              <button
                v-if="userRole !== 'student'"
                type="button"
                class="btn btn-primary w-100"
                data-bs-toggle="modal"
                data-bs-target="#add-course"
              >
                + New Course
              </button>
            </div>
            <!-- Filtering for instructors -->
            <div v-if="userRole !== 'student'" class="col-6 col-md-auto">
              <select v-model="supervisorFilter" class="form-select" aria-label="Filter by supervisor">
                <option value="">All courses</option>
                <option value="mine">My courses</option>
                <option value="others">Other courses</option>
              </select>
            </div>
          </form>
        </div>

        <!-- Course creation modal (existing) -->
        <courseModal @add-course="addCourse" :allLessons="this.allLessons"/>

        <!-- Grid -->
        <div class="row g-3 row-cols-1 row-cols-sm-1 row-cols-lg-3">
          <div
            v-for="c in visibleCourses"
            :key="c.id"
            class="col"
          >
            <div class="card h-100 shadow-sm">
              <div class="ratio ratio-21x9" style="background:conic-gradient(from 240deg at 60% 40%, #7c8cff55, #22d3ee55, #7c8cff55)"></div>

              <div class="card-body d-grid gap-2">
                <!-- Title + status pill -->
                <div class="d-flex justify-content-between align-items-start">
                  <h2
                    class="h5 card-title mb-0"
                    @dblclick="goToCourse(c)"
                    style="cursor: pointer"
                  >{{ c.title }}</h2>
                  <span class="badge text-bg-success" v-if="c.status === 'published' && userRole !== 'student'">Published</span>
                  <span class="badge text-bg-warning text-dark" v-if="c.status === 'draft' && userRole !== 'student'">Draft</span>
                  <span class="badge text-bg-secondary" v-if="c.status === 'archived' && userRole !== 'student'">Archived</span>
                  <span v-if="userRole === 'student' && c.isCompleted" class="badge text-bg-info">
                    Completed
                  </span>
                </div>

                <!-- Overview -->
                <ul class="list-unstyled small mb-0 kv-grid">
                  <li><span class="label" @click="console.log('Completed?', c.isCompleted)"><strong>ID</strong></span><span class="value text-muted">{{ c.id }}</span></li>
                  <li><span class="label"><strong>Owner</strong></span><span class="value text-muted">{{ c.supervisor }}</span></li>
                  <li><span class="label"><strong>Total Credit Points</strong></span><span class="value text-muted">{{ c.credits }}</span></li>
                </ul>
              </div>

              <div class="card-footer  d-flex justify-content-between align-items-center">
  <!-- Left side: Completion percentage (for students only) -->
<div v-if="userRole === 'student' && (c.isEnrolled || c.isCompleted)" class="text-muted small">
  <strong>Progress:</strong>
  {{ c.isCompleted ? 100 : (c.percentage ?? 'Loading') }}%
</div>

  

  <!-- Right side: Action buttons -->
  <div class="d-flex gap-2">
    <button
      v-if="$ADMIN_EMAIL === currentUser || c.supervisor === currentUser"
      type="button"
      class="btn btn-outline-secondary btn-sm"
      @click="openEdit(c)"
    >
      Edit
    </button>

    <button
      v-if="$ADMIN_EMAIL === currentUser || c.supervisor === currentUser"
      type="button"
      class="btn btn-outline-danger btn-sm"
      @click="openDelete(c)"
    >
      Delete
    </button>

    <button
      v-if="userRole === 'student' && !c.isEnrolled && !c.isCompleted"
      type="button"
      class="btn btn-outline-success btn-sm"
      @click="openEnrol(c)"
    >
      Enrol
    </button>

    
    <div 
      v-if="userRole === 'student' && c.isEnrolled && !c.isCompleted" 
      class="d-flex justify-content-between align-items-center"
    >
      <!-- <span class="text-success">
        Enrolled
      </span> -->

      <button 
        class="btn btn-outline-danger btn-sm"
        @click="openUnenrol(c)"
      >
        Unenrol
      </button>
    </div>
    <span v-if="userRole === 'student' && c.isCompleted" class="text-info">
    Completed
    </span>
  </div>
</div>
            </div>
          </div>

          <div v-if="!visibleCourses.length" class="col-12">
            <div class="border rounded-3 p-4 text-center text-muted">
              No courses match your filters.
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <course-edit
    :course="selected"
    :all-lessons="allLessons"
    @saved="handleEditSaved"
  />

  <course-delete
    :course-to-delete="selected"
    @confirmed="handleDeleteConfirmed"
  />

  <course-enrol
  v-if="userRole === 'student'"
  :course-to-enrol="selected"
  :student="currentUser"
  @enrol-course="handleEnrolConfirmed"
/>

  <course-unenrol
  v-if="userRole === 'student'"
  :course-to-unenrol="selected"
  :student="currentUser"
/>
  <!-- ==================================================================== -->
</template>

<script>
import TeacherSidebar from '../components/teacher-sidebar.vue'
import courseModal from '../components/course-modal.vue'

// Your existing modal components (filenames you mentioned)
import CourseEdit from '../components/course-edit.vue'
import CourseDelete from '../components/course-delete.vue'
import CourseEnrol from '../components/course-enrol.vue'
import CourseUnenrol from '../components/course-unenrol.vue'

import { getAllCourses, createCourse, getLessons, getLessonsForStudent, getCourseById, markCourseCompleted} from "../api";

export default {
  name: 'CoursesPage',
  components: { TeacherSidebar, courseModal, CourseEdit, CourseDelete, CourseEnrol, CourseUnenrol},
  data() {
    return {
      // toolbar state
      userRole: 'instructor', // BACKEND || Student/instructor view
      supervisorFilter: '',
      currentUser: 'Ada Lovelace',
      courses: [],
      allLessons: [],
      status: '',

      // selection + modals
      selected: null,
      editForm: null,  // kept if your edit component needs it; otherwise unused

    }
  },
  mounted() {
    // STORE THE CURRENT ROLE
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) this.userRole = user.role;
    this.currentUser = user.email;
    this.user_id = user._id;
    this.fetchCourses()
    this.fetchLessons();

  },
  computed: {
    visibleCourses() {
      let list = [...this.courses]
      if (this.supervisorFilter === 'mine') {
        list = list.filter(c =>
          c.supervisor === this.currentUser
        )
        console.log("Me:", this.currentUser)
      } else if (this.supervisorFilter === 'others') {
        list = list.filter(c =>
          !(c.supervisor === this.currentUser)
        )
      }
      if (this.userRole === 'student') {
        list = list.filter(c => c.status === 'published')
        // Reorder: classrooms with current user first, then others
        list = [
          ...list.filter(c => c.enrolledStudents?.includes(this.user_id)),
          ...list.filter(c => !c.enrolledStudents?.includes(this.user_id))
        ]
      }
      console.log(list)
      return list
      
    },
  },
  methods: {
    // ---------- UI helpers ----------
    openEdit(course) {
      this.selected = course
      // If your CourseEdit uses a different modal id, change this
      const el = document.getElementById('edit-course')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },
    openDelete(course) {
      this.selected = course
      const el = document.getElementById('delete-course')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },
    openEnrol(course) {
      this.selected = course
      const el = document.getElementById('enrol-course')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },
    openUnenrol(course) {
      this.selected = course
      const el = document.getElementById('unenrol-course')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },


    // ---------- Handlers from modal components ----------
    handleEditSaved(updated) {
      // updated may be { ...course } or { course: {...} } depending on your component
      const next = updated?.course || updated
      if (!next?.id) return
      const i = this.courses.findIndex(c => c.id === next.id)
      if (i !== -1) {
        // Vue 2 reactivity-safe update
        this.$set ? this.$set(this.courses, i, next) : (this.courses[i] = next)
      }
      const modalEl = document.getElementById("edit-course");
      bootstrap.Modal.getInstance(modalEl).hide();
    },
    handleDeleteConfirmed(payload) {
      const id = payload?.id ?? this.selected?.id
      if (!id) return
      this.courses = this.courses.filter(c => c.id !== id)
    },
    handleEnrolConfirmed(payload) {
      // If you need to reflect enrolment locally, do it here
      // payload might include course id, user, etc.
      // For now, just a toast/log:
      console.info('Enrol confirmed:', payload || this.selected)
      window.location.reload(true)
    },

    // ---------- Existing code ----------
    truncate(text, n = 140) {
      if (!text) return ''
      return text.length > n ? text.slice(0, n - 1) + '…' : text
    },
    goToCourse(course) {
      this.$router.push(`/courses/${course._id}`)
    },
    async fetchCourses() {
  try {
    const { data } = await getAllCourses();

    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const enrolledId = user.enrolledCourse || null; // just one course ID

    const userEmail = user.email;
    const completed = user.completedCourses || [];

    console.log("CHECKING COMPLETED", user.completedCourses, enrolledId)
    // Mark which course is the user's enrolled one
    this.courses = data.map(c => ({
      ...c,
      isEnrolled: enrolledId && c._id === enrolledId,
      isCompleted: completed.includes(c._id),
      percentage: null // default until we calculate it
    }));
    console.log("Jeevana COURSES")
    console.log(enrolledId)
    // ----- Only do progress calculation for students -----
    if (user.role === "student" && enrolledId) { // this is OBJECT ID
      // 1️⃣ Fetch the full course (lessons populated)
      const { data: enrolledCourse } = await getCourseById(enrolledId);

      // 2️⃣ Fetch all lessons + grades for this student
      const { data: studentLessons } = await getLessonsForStudent(userEmail);

      // 3️⃣ Extract IDs of lessons belonging to the enrolled course
      const courseLessonIds = enrolledCourse.lessons.map(l => l._id);
      // ABOVE LIST IS NOT AN ACCURATE LENGTH MEASUREMENT AS CAN CONTAIN ARCHIVE/DRAFT LESSONS!
      // USE STUDENTS LESSONS FOR ACCURATE MEASURE OF LENGTH

      // 4️⃣ Filter the student’s graded lessons to only those in this course
      const studentCourseGrades = studentLessons.filter(l =>
        courseLessonIds.includes(l._id || l.lesson)
      );

      // 5️⃣ Count how many lessons have been passed
      const totalLessons = studentCourseGrades.length;
      console.log("Lessons in enrolled course:", studentCourseGrades)

      const gradedLessons = studentCourseGrades.filter(
        l => l.grade && l.grade.toLowerCase() === "pass"
      )

      const passedLessons = studentCourseGrades.filter(
        l => l.grade && l.grade.toLowerCase() === "pass"
      ).length;

      // 6️⃣ Calculate percentage (avoid division by zero)
      const percentage =
        totalLessons > 0 ? Math.round((passedLessons / totalLessons) * 100) : 100;


      const isCompleted = 
      gradedLessons.length === totalLessons;

      // 7️⃣ Add percentage to the enrolled course
      this.courses = this.courses.map(c =>
        c._id === enrolledId ? { ...c, percentage, isCompleted } : c
      );
      console.log("Total lessons", totalLessons)
      console.log("Total passed Lessons", passedLessons)

      if (isCompleted) {
        try {
          await markCourseCompleted(this.user_id, enrolledId);
          console.log(`✅ ${enrolledId} marked as completed in backend`);
        } catch (err) {
          console.error("Failed to mark completion:", err);
        }
      }
      console.log(
        `Course ${enrolledCourse.title} completion: ${percentage}%`
      );
    }
  } catch (err) {
    console.error("Failed to fetch courses:", err);
  }
},
    async addCourse(course) {
      try {
        const { data } = await createCourse(course);
        window.location.reload(true);
        this.courses.push(data);
        alert('Course added successfully!');
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to add course');
      }
    },
    async fetchLessons() {
      try {
        const { data } = await getLessons();
        // this.allLessons = data.map(lesson => lesson._id);
        this.allLessons = data;
        console.log("ALL LESSONS HEREEEEEEE", this.allLessons);
      } catch (err) {
        console.error("Failed to fetch lessons:", err);
      }
    },

  }
}
</script>

