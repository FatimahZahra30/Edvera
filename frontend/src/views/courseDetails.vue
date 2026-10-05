<template>
  <div class="layout">
    <aside class="sidebar">
      <TeacherSidebar page-title="Course Details" />
    </aside>

    <main class="content">
      <div class="content-pad">
        <!-- Course Header -->
        <div class="left-align d-flex flex-column flex-md-row align-items-start justify-content-between mb-3">
          <div>
            <div class="d-flex flex-row align-items-between">
              <h1 class="h4 mb-1">{{ course.title }}</h1>
            </div>
            <div class="text-muted">Course ID: {{ course.id || course._id }}</div>
          </div>
        </div>

        <!-- General Information -->
        <section class="mb-4 text-start">
          <h2 class="h5 mb-3 bold">General Information</h2>
          <div class="mb-3">
            <h3 class="h6 mb-1 bold">Description</h3>
            <p class="mb-0">{{ course.description }}</p>
          </div>

          <div class="mb-1"><span class="h6 bold">Date Created:</span> <span>{{ fmt(course.createdAt) }}</span></div>
          <div class="mb-1"><span class="h6 bold">Date Updated:</span> <span>{{ fmt(course.updatedAt) }}</span></div>
          <div class="mb-1" v-if="userRole !== 'student'"><span class="h6 bold">Status:</span> <span>{{ course.status }}</span></div>
          <div class="mb-1"><span class="h6 bold">Total Credit Points:</span> <span>{{ course.credits }}</span></div>
          <div class="mb-1"><span class="h6 bold">Owner:</span> <span>{{ course.supervisorFirstName }} {{ course.supervisorLastName }} ({{ course.supervisor }})</span></div>
        </section>

        <!-- Lessons -->
        <section class="mb-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <h3 class="h5 mb-0">Lessons</h3>
              <div class="text-muted small">{{ course.lessons?.length }} total</div>
            </div>
            <button
              class="btn btn-sm btn-outline-secondary"
              type="button"
              @click="lessonsExpanded = !lessonsExpanded"
            >
              {{ lessonsExpanded ? 'Collapse' : 'Expand' }}
            </button>          
          </div>
          
          <div v-show="lessonsExpanded">
            <ul v-if="course.lessons?.length" class="list-group">
              <template v-for="ls in course.lessons">
                <li 
                  v-if="userRole !== 'student' || (userRole === 'student' && ls.status === 'published')"
                  :key="ls.id || ls._id || ls.code" 
                  class="list-group-item left-align"
                >
                  <div class="d-flex align-items-start w-100">
                    <div class="flex-grow-1">
                      <div class="fw-semibold" @dblclick="goToLesson(ls)" style="cursor: pointer">
                        {{ ls.title || ls.name || 'Untitled lesson' }}
                      </div>
                      <small class="text-muted">ID: {{ ls.id || '—' }} | Credit points: {{ ls.credit }}</small>
                    </div>

                    <div class="ms-3 d-flex align-items-center gap-2">
                      <span class="badge text-bg-success" v-if="ls.status === 'published' && userRole !== 'student'">Published</span>
                      <span class="badge text-bg-warning text-dark" v-if="ls.status === 'draft' && userRole !== 'student'">Draft</span>
                      <span class="badge text-bg-secondary" v-if="ls.status === 'archived' && userRole !== 'student'">Archived</span>
                    </div>
                  </div>
                </li>
              </template>
            </ul>

            <div v-else class="border rounded-3 p-4 text-center text-muted">
              No lessons have been added to this course.
            </div>
          </div>
        </section>

        <!-- Classrooms -->
        <section>
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h3 class="h5 mb-0">Classrooms</h3>
            <div class="text-muted small">{{ course.classrooms?.length || 0 }} total</div>
          </div>

          <div class="row g-3 row-cols-1 row-cols-sm-1 row-cols-lg-3">
            <div v-for="cl in course.classrooms" :key="cl._id" class="col">
              <div v-if="userRole !== 'student' || cl.status === 'Published'" class="card h-100 shadow-sm">
                <div class="ratio ratio-21x9" style="background:conic-gradient(from 240deg at 60% 40%, #7c8cff55, #22d3ee55, #7c8cff55)"></div>

                <div class="card-body d-grid gap-2">
                  <div class="d-flex justify-content-between align-items-start">
                    <h4 class="h6 card-title mb-0" @dblclick="goToClassroom(cl)" style="cursor: pointer">
                      {{ cl.name }}
                    </h4>
                    <span
                      v-if="userRole !== 'student'"
                      class="badge"
                      :class="{
                        'text-bg-success': cl.status === 'Published',
                        'text-bg-warning text-dark': cl.status === 'Draft',
                        'text-bg-secondary': cl.status === 'Archived'
                      }"
                    >
                      {{ cl.status }}
                    </span>
                  </div>

                  <ul class="list-unstyled small mb-0 kv-grid">
                    <li><strong>ID:</strong> <span class="text-muted">{{ cl.classroomID || cl._id }}</span></li>
                    <li><strong>Owner:</strong> <span class="text-muted">{{ cl.supervisor || cl.owner || '—' }}</span></li>
                    <li><strong>Start Date:</strong> <span class="text-muted">{{ fmt(cl.startDate) }}</span></li>
                    <li><strong>End Date:</strong> <span class="text-muted">{{ fmt(cl.endDate) }}</span></li>
                  </ul>
                </div>

                <div class="card-footer d-flex gap-2 align-items-center">
                  <template v-if="userRole !== 'student'">
                    <button v-if="cl.supervisor === userEmail && (isFutureClassroom(cl) || noStudentsEnrolled(cl))" class="btn btn-outline-secondary btn-sm" @click="openEditModal(cl)">Edit</button>
                    <button v-if="cl.supervisor === userEmail && (isFutureClassroom(cl) || noStudentsEnrolled(cl))" class="btn btn-outline-danger btn-sm" @click="openDeleteModal(cl)">Delete</button>
                    <button v-if="cl.supervisor === userEmail" class="btn btn-outline-primary btn-sm ms-auto" @click="goToGrading(cl)">Grading</button>
                  </template>
                  <template v-else>
                    <button v-if="!cl.students?.includes(currentUser?._id)" class="btn btn-outline-success btn-sm" data-bs-toggle="modal" data-bs-target="#enrol-classroom" @click="selectedClassroom = cl">
                      Enrol
                    </button>
                    <span v-else class="text-success">Enrolled</span>
                  </template>
                </div>
              </div>
            </div>

            <div v-if="!course.classrooms?.length" class="col-12">
              <div class="border rounded-3 p-4 text-center text-muted">No classrooms created for this course.</div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>

  <!-- MODALS -->
  <classroomEditModal
    v-if="userRole !== 'student'"
    :classroom="selectedClassroom"
    :all-courses="allCourses"
    :all-lessons="allLessons"
    @classroom-updated="handleClassroomUpdated"
  />

  <classroomDeleteModal
    v-if="userRole !== 'student'"
    :classroom-to-delete="selectedClassroom"
    @delete-classroom="handleClassroomDeleted"
  />

  <ClassroomEnrol
    v-if="userRole === 'student'"
    :classroom-to-enrol="selectedClassroom"
    @enrol-classroom="handleEnrol"
  />
</template>

<script>
import TeacherSidebar from '../components/teacher-sidebar.vue'
import ClassroomEditModal from '../components/classroom-edit-modal.vue'
import ClassroomDeleteModal from '../components/classroom-delete-modal.vue'
import ClassroomEnrol from '../components/classroom-enrol.vue'
import { Modal } from 'bootstrap'
import { getCourseById, getClassrooms, getLessons, getAllCourses, updateClassroom, deleteClassroom, getSupervisors } from '../api'

export default {
  name: 'CourseDetailsPage',
  props: { id: { type: String, required: true } },
  components: { TeacherSidebar, ClassroomEditModal, ClassroomDeleteModal, ClassroomEnrol },

  data() {
    return {
      lessonsExpanded: true,
      userRole: 'student',
      currentUser: null,
      allCourses: [],
      allLessons: [],
      course: { title: '', description: '', classrooms: [], lessons: [] },
      selectedClassroom: null,
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    if (user) {
      this.userRole = user.role
      this.currentUser = user
      this.userEmail = user.email
    }

    try {
      const [{ data: courseData }, { data: allClassrooms }, { data: allLessons }] =
        await Promise.all([getCourseById(this.id), getClassrooms(), getLessons()])

      const relatedClassrooms = allClassrooms.filter(cl =>
        cl.associatedCourse?.includes(courseData._id)
      )
      if (this.userRole === 'student') {
        const filteredCourse = {
          ...courseData,
          lessons: courseData.lessons.filter(l => l.status === 'published')
        }
        const publishedClassrooms = relatedClassrooms.filter(cl => cl.status === 'Published')
        this.course = { ...filteredCourse, classrooms: publishedClassrooms } 
      } else {
        this.course = { ...courseData, classrooms: relatedClassrooms }
      }
      this.allLessons = allLessons
      this.allCourses = await getAllCourses().then(res => res.data)

      const { data: supervisors } = await getSupervisors()
      const supervisor = supervisors.find(s => s.email === this.course.supervisor)
      if (supervisor) {
        Object.assign(this.course, {
          supervisorFirstName: supervisor.firstName,
          supervisorLastName: supervisor.lastName,
        })
      }
    } catch (err) {
      console.error('Failed to load course data:', err)
    }
  },

  methods: {
    isFutureClassroom(room) {
      if (!room?.startDate) return false
      const start = new Date(room.startDate)
      const now = new Date()
      return start > now
    },
    noStudentsEnrolled(room) {
      if (room.students.length == 0) {
        return true
      }
      return false
    },
    fmt(iso) {
      if (!iso) return '—'
      return new Date(iso).toLocaleDateString()
    },

    goToClassroom(cl) {
      this.$router.push(`/classrooms/${cl.classroomID}`)
    },

    goToLesson(ls) {
      this.$router.push(`/lessons/${ls.id}`)
    },

    goToGrading(cl) {
      this.$router.push(`/classrooms/${cl.classroomID}/grading`)
    },

    async openEditModal(cl) {
      this.selectedClassroom = { ...cl }
      if (!this.allCourses.length) {
        const res = await getAllCourses()
        this.allCourses = res.data
      }
      this.$nextTick(() => Modal.getOrCreateInstance('#edit-classroom')?.show())
    },

    openDeleteModal(cl) {
      this.selectedClassroom = { ...cl }
      this.$nextTick(() => Modal.getOrCreateInstance('#delete-classroom')?.show())
    },

    async handleClassroomUpdated(updated) {
      try {
        const res = await updateClassroom(updated.classroomID, updated)
        const saved = res.data?.updatedClassroom ?? res.data ?? updated
        const i = this.course.classrooms.findIndex(c => c.classroomID === saved.classroomID)
        if (i !== -1) this.course.classrooms.splice(i, 1, saved)
        Modal.getInstance('#edit-classroom')?.hide()
      } catch (err) {
        console.error('Classroom update failed:', err)
      }
    },

    async handleClassroomDeleted(cl) {
      try {
        await deleteClassroom(cl.classroomID)
        this.course.classrooms = this.course.classrooms.filter(c => c.classroomID !== cl.classroomID)
        Modal.getInstance('#delete-classroom')?.hide()
      } catch (err) {
        console.error('Delete classroom failed:', err)
      }
    },
  },
}
</script>
