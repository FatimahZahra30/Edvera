<template>
  <div class="layout">
    <aside class="sidebar">
      <TeacherSidebar page-title="Grading System" />
    </aside>

    <!-- Feedback Modal -->
    <div class="modal fade" id="feedback-modal" tabindex="-1">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="saveFeedback">
          <div class="modal-header">
            <h5 class="modal-title">Feedback – {{ modalLesson?.name }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <label class="form-label">Feedback</label>
            <textarea
              v-model.trim="feedbackText"
              class="form-control"
              rows="4"
              placeholder="Write concise, actionable feedback..."
            ></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>

    <main class="content">
      <div class="content-pad">
        <!-- Header -->
        <div class="d-flex flex-column flex-md-row align-items-start justify-content-between mb-3">
          <div>
            <h1 class="h4 mb-1">Grading – {{ classroomId }}</h1>
          </div>
        </div>

        <!-- Students list -->
        <section class="mb-4">
          <h2 class="h5 mb-3">Students</h2>
          <div class="list-group">
            <div
              v-for="(s, index) in students"
              :key="s.email"
              class="list-group-item list-group-item-action d-flex align-items-center justify-content-between student-row"
              @click="selectStudent(s)"
              style="cursor: pointer;"
            >
              <div class="d-flex align-items-center gap-3">
                <span class="fw-bold me-2">{{ index + 1 }}.</span>
                <span class="fw-semibold">{{ s.firstName }} {{ s.lastName }}</span>
                <small class="text-muted ms-3">{{ s.email }}</small>
              </div>
              <span class="badge bg-secondary">View</span>
            </div>
          </div>

          <div v-if="!students.length" class="border rounded-3 p-4 text-center text-muted mt-3">
            No students enrolled.
          </div>
        </section>

        <!-- Lessons for selected student -->
        <section v-if="selectedStudent">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h2 class="h5 mb-0">
              Lessons for {{ selectedStudent.firstName }} {{ selectedStudent.lastName }}
              ({{ selectedStudent.email }})
            </h2>
            <div class="small text-muted" v-if="myEmail">Signed in as: {{ myEmail }}</div>
          </div>

          <div class="row g-3 row-cols-1 row-cols-lg-2">
            <div class="col" v-for="lsn in lessons" :key="lsn.id">
              <div class="card h-100 shadow-sm">
                <div class="card-body d-grid gap-2">
                  <div class="d-flex align-items-start position-relative">
                    <div class="text-center w-100">
                      <h3 class="h6 mb-0">{{ lsn.name }}</h3>
                      <div class="small text-muted">Lesson ID: {{ lsn.id }}</div>
                      <div class="small text-muted">Owner: {{ displayOwner(lsn) }}</div>
                    </div>
                    <span class="badge position-absolute top-0 end-0" :class="statusClass(lsn.status)">
                      {{ lsn.grade || 'Ungraded' }}
                    </span>
                  </div>

                  <div class="d-flex justify-content-between gap-2 mt-1 align-items-start">
                    <!-- Grade Dropdown -->
                    <div class="form-group mb-0">
                      <label class="form-label small text-muted me-2">Grade:</label>
                      <select
                        class="form-select form-select-sm"
                        v-model="lsn.grade"
                        @change="setGrade(lsn, selectedStudent.email)"
                      >
                        <option value="Ungraded">Ungraded</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                      </select>
                    </div>

                    <!-- Feedback -->
                    <button class="btn btn-sm btn-outline-primary" @click="openFeedback(lsn)">
                      Feedback
                    </button>
                  </div>

                  <div v-if="lsn.feedback" class="small text-muted mt-1">
                    <strong>Feedback:</strong> {{ lsn.feedback }}
                  </div>
                </div>
              </div>
            </div>

            <div v-if="selectedStudent && !lessons.length" class="col-12 w-100">
              <div class="border rounded-3 p-4 text-center text-muted">
                No lessons found for this classroom.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import TeacherSidebar from '../components/teacher-sidebar.vue'
import { getClassroomStudents, getStudentLessons, updateGrade, updateFeedback } from '../api'

export default {
  name: 'GradingSystem',
  components: { TeacherSidebar },

  data() {
    return {
      classroomId: this.$route.params.id,
      myEmail: null,
      students: [],
      selectedStudent: null,
      lessons: [],
      modalLesson: null,
      feedbackText: '',
    }
  },

  async mounted() {
    const u = JSON.parse(localStorage.getItem('user'))
    this.myEmail = u?.email || null //supervisor email
    await this.fetchStudents()



  },

  methods: {
    async fetchStudents() {
      try {
        const { data } = await getClassroomStudents(this.classroomId)
        this.students = Array.isArray(data) ? data : []
        console.log(this.students)
      } catch (e) {
        console.error('Failed to fetch students:', e?.response?.data || e?.message)
      }
    },

    async selectStudent(s) {
      this.selectedStudent = s
      try {
        const { data } = await getStudentLessons(s.email, this.classroomId)
        this.lessons = Array.isArray(data) ? data : []
        console.log(this.lessons)
      } catch (e) {
        console.error('Failed to fetch lessons:', e?.response?.data || e?.message)
      }
    },

    statusClass(status) {
      return {
        'text-bg-success': status === 'Pass',
        'text-bg-warning text-dark': status === 'Fail',
        'text-bg-secondary': !status || status === 'Ungraded'
      }
    },

    displayOwner(lsn) {
      const owner = lsn.creatorEmail || lsn.creator || '—'
      return owner
    },

    isMyLesson(lsn) {
      const owner = lsn.creatorEmail || lsn.creator
      return !!this.myEmail && owner === this.myEmail
    },

    async setGrade(lsn, studentEmail) {
      console.log(lsn)
      const newGrade = {grade: lsn.grade}
      console.log(lsn.id, studentEmail, newGrade)

      try {
        const graded = await updateGrade(lsn.id, studentEmail, newGrade)
        console.log(graded)
      } catch (e) {
        alert('Could not save grade — try again.')
      }
    },

    openFeedback(lsn) {
      this.modalLesson = lsn

      this.feedbackText = lsn.feedback || ''
      const el = document.getElementById('feedback-modal')
      Modal.getOrCreateInstance(el).show()
    },

    async saveFeedback() {
      try {
        console.log(this.selectedStudent.email, this.modalLesson.id, this.feedbackText)
        
        const el = document.getElementById('feedback-modal')
        const modalInstance = Modal.getOrCreateInstance(el)
        modalInstance.hide()
        
        this.modalLesson.feedback = this.feedbackText
        await updateFeedback(this.modalLesson.id, this.selectedStudent.email, {feedback: this.feedbackText})
      } catch (e) {
        alert('Could not save feedback — try again.')
      }
    }
  }
}
</script>
