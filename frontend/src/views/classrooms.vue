<template>
  <div class="layout">
    <aside class="sidebar">
      <TeacherSidebar pageTitle="Classrooms" />
    </aside>

    <main class="content">
      <div class="content-pad">
        <!-- Toolbar -->
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
          <form class="row g-2" @submit.prevent>
            <div v-if="userRole !== 'student'" class="col-12 col-md-auto">
              <button
                type="button"
                class="btn btn-primary w-100"
                data-bs-toggle="modal"
                data-bs-target="#add-classroom"
              >
                + New Classroom
              </button>
            </div>

            <div v-if="userRole !== 'student'" class="col-6 col-md-auto">
              <select
                v-model="supervisorFilter"
                class="form-select"
                aria-label="Filter by supervisor"
              >
                <option value="">All classrooms</option>
                <option value="mine">My classrooms</option>
                <option value="others">Other classrooms</option>
              </select>
            </div>
          </form>
        </div>

        <!-- Grid -->
        <div class="row g-3 row-cols-1 row-cols-sm-1 row-cols-lg-3">
          <div v-for="room in visibleClassrooms" :key="room.classroomID" class="col">
            <div class="card h-100 shadow-sm">
              <div
                class="ratio ratio-21x9"
                style="background:conic-gradient(from 240deg at 60% 40%, #7c8cff55, #22d3ee55, #7c8cff55)"
              ></div>

              <div class="card-body d-grid gap-2">
                <!-- Title + status pill -->
                <div class="d-flex justify-content-between align-items-start">
                  <h2
                    class="h5 card-title mb-0"
                    @dblclick="goToClassroom(room)"
                    style="cursor: pointer"
                  >
                    {{ room.name }}
                  </h2>

                  <span
                    v-if="userRole !== 'student'"
                    class="badge"
                    :class="{
                      'text-bg-success': room.status === 'Published',
                      'text-bg-warning text-dark': room.status === 'Draft',
                      'text-bg-secondary': room.status === 'Archived'
                    }"
                  >
                    {{ room.status }}
                  </span>
                </div>

                <!-- Overview -->
                <ul class="list-unstyled small mb-0 kv-grid">
                  <li>
                    <span class="label"><strong>ID</strong></span>
                    <span class="value text-muted">{{ room.classroomID }}</span>
                  </li>
                  <li>
                    <span class="label"><strong>Owner</strong></span>
                    <span class="value text-muted">{{ room.supervisor }}</span>
                  </li>
                  <li>
                    <span class="label"><strong>Start Date</strong></span>
                    <span class="value text-muted">{{ formatDate(room.startDate) }}</span>
                  </li>
                  <li>
                    <span class="label"><strong>End Date</strong></span>
                    <span class="value text-muted">{{ formatDate(room.endDate) }}</span>
                  </li>
                </ul>
              </div>

              <!-- Footer -->
              <div class="card-footer d-flex gap-2 align-items-center">
                <!-- Teacher actions -->
                <template v-if="userRole !== 'student' && (room.supervisor === userEmail || userEmail === 'chongchunyuan@gmail.com')">
                  <button
                    v-if="isFutureClassroom(room) || noStudentsEnrolled(room)"
                    type="button"
                    class="btn btn-outline-secondary btn-sm"
                    @click="openEditModal(room)"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    @click="openDeleteModal(room)"
                  >
                    Delete
                  </button>
                    <!-- "room.supervisor === userEmail -->
                  <button
                    v-if="room.supervisor === userEmail || userEmail === 'chongchunyuan@gmail.com'"
                    type="button"
                    class="btn btn-outline-primary btn-sm ms-auto"
                    @click="goToGrading(room)"
                  >
                    Grading
                  </button>
                </template>

                <!-- Student actions -->
                <template v-if="userRole === 'student'">
                  <button
                    v-if="!room.students?.includes(userId)"
                    type="button"
                    class="btn btn-outline-success btn-sm"
                    data-bs-toggle="modal"
                    data-bs-target="#enrol-classroom"
                    @click="selectedClassroom = room"
                  >
                    Enrol
                  </button>
                  
                  <!-- Enrolled -->
                  <div 
                    v-else 
                    class="d-flex flex-row align-items-center justify-content-between w-100">
                    <template v-if="isClassroomCompleted(room)">
                      <div>
                        <span class="text-info">Completed</span>
                      </div>
                      <div>
                        <span class="text-success fw-semibold">Enrolled</span>
                      </div>
                    </template>

                    <template v-else>
                      <div>
                        <span class="text-success fw-semibold">Enrolled</span>
                      </div>
                      <div>
                        <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#unenrol-classroom"
                        @click="selectedClassroom = room"
                        >
                          Unenroll
                      </button>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!visibleClassrooms.length" class="col-12">
          <div class="border rounded-3 p-4 text-center text-muted">
            No classrooms match your filters.
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modals -->
  <classroom-modal
    v-if="userRole !== 'student'"
    :all-classrooms="classrooms"
    @add-classroom="addClassroom"
  />

  <classroomEditModal
    v-if="userRole !== 'student'"
    :classroom="selectedClassroom"
    :all-classrooms="classrooms"
    :all-courses="allCourses"
    :all-lessons="allLessons"
    @classroom-updated="handleClassroomUpdated"
  />

  <classroomDeleteModal
    v-if="userRole !== 'student'"
    :classroom-to-delete="selectedClassroom"
    @delete-classroom="handleDelete"
  />

  <ClassroomEnrol
    v-if="userRole === 'student'"
    :classroom-to-enrol="selectedClassroom"
    @enrol-classroom="handleEnrol"
  />

  <ClassroomUnenrol
    v-if="userRole === 'student'"
    :classroom-to-unenrol="selectedClassroom"
  />
</template>

<script>
import { Icon } from '@iconify/vue'
import { Modal } from 'bootstrap'
import TeacherSidebar from '../components/teacher-sidebar.vue'
import classroomModal from '../components/classroom-modal.vue'
import classroomEditModal from '../components/classroom-edit-modal.vue'
import classroomDeleteModal from '../components/classroom-delete-modal.vue'
import ClassroomEnrol from '../components/classroom-enrol.vue'
import { getClassrooms, createClassroom, deleteClassroom, getAllCourses, getLessons, updateClassroom } from '../api'
import ClassroomUnenrol from '../components/classroom-unenrol.vue'

export default {
  name: 'Classrooms',
  components: {
    Icon,
    TeacherSidebar,
    classroomModal,
    classroomEditModal,
    classroomDeleteModal,
    ClassroomEnrol,
    ClassroomUnenrol,
  },

  data() {
    return {
      classrooms: [],
      allCourses: [],
      allLessons: [],
      selectedClassroom: null,
      supervisorFilter: '',

      userRole: 'student',
      userId: null,
      userEmail: null,
      userCourse: null,
    }
  },

  computed: {
    isTeacher() {
      return this.userRole === 'teacher'
    },
    isStudent() {
      return this.userRole === 'student'
    },

    visibleClassrooms() {
      let list = Array.isArray(this.classrooms) ? [...this.classrooms] : []

      if (this.supervisorFilter === 'mine') {
        list = list.filter(c => c.supervisor === this.userEmail)
      } else if (this.supervisorFilter === 'others') {
        list = list.filter(c => c.supervisor !== this.userEmail)
      }

      if (this.isStudent) {
        console.log("COMPUTING IS STUDENT,", this.userCourse)
        if (this.userCourse === null) { return [] }
        list = list.filter(c => c.status === 'Published' && c.associatedCourse?.[0] === this.userCourse)
        
        list = list.sort((a, b) => {
          const aHasUser = Array.isArray(a.students) && a.students.includes(this.userId)
          const bHasUser = Array.isArray(b.students) && b.students.includes(this.userId)
          return (bHasUser ? 1 : 0) - (aHasUser ? 1 : 0)
        })
      }

      return list
    }
  },

  async mounted() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      if (user) {
        this.userRole = user.role || this.userRole
        this.userId = user._id || user.id || this.userId
        this.userEmail = user.email || this.userEmail
        this.userCourse = user.enrolledCourse || this.userCourse
      }
    } catch (e) {
      console.warn('Failed to parse user from localStorage', e)
    }

    try {
      const [classroomsRes, coursesRes, lessonsRes] = await Promise.all([
        getClassrooms(),
        getAllCourses(),
        getLessons(),
      ])

      this.classrooms = classroomsRes?.data || []
      this.allCourses = coursesRes?.data || []
      this.allLessons = lessonsRes?.data || []
    } catch (err) {
      console.error('Failed to fetch data:', err?.response?.data || err?.message)
    }
    console.log("IS STUDENT,", this.userCourse)
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
    goToClassroom(room) {
      if (!room?.classroomID) return
      this.$router.push(`/classrooms/${room.classroomID}`)
    },

    goToGrading(room) {
      if (!room?.classroomID) return
      this.$router.push(`/classrooms/${room.classroomID}/grading`)
    },

    formatDate(iso) {
      if (!iso) return '—'
      try {
        return new Intl.DateTimeFormat(undefined, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
        }).format(new Date(iso))
      } catch {
        return iso
      }
    },

    openEditModal(room) {
      this.selectedClassroom = {...room}
      this.$nextTick(() => Modal.getOrCreateInstance('#edit-classroom')?.show())
    },

    openDeleteModal(room) {
      this.selectedClassroom = {...room}
      this.$nextTick(() => Modal.getOrCreateInstance('#delete-classroom')?.show())
    },

    closeModal(id) {
      Modal.getInstance(`#${id}`)?.hide()
    },
    isClassroomCompleted(room){
      if (!room?.endDate) return false
      const today = new Date()
      const end = new Date(room.endDate)
      return today > end
    },

    async handleClassroomUpdated(updated) {
      try {
        const res = await updateClassroom(updated.classroomID, updated)
        const saved = res?.data?.updatedClassroom ?? res?.data ?? updated
        const i = this.classrooms.findIndex(r => r.classroomID === saved.classroomID)
        if (i !== -1) this.classrooms.splice(i, 1, saved)
        this.closeModal('edit-classroom')
      } catch (err) {
        console.error('Failed to update classroom:', err?.response?.data || err?.message)
        alert('Failed to save changes. Please try again.')
      }
    },

    async addClassroom(room) {
      try {
        const res = await createClassroom(room)
        const created = res?.data ?? room
        this.classrooms.unshift(created)
        this.closeModal('add-classroom')
      } catch (err) {
        const status = err?.response?.status
        if (status === 409 || status === 400) {
          alert('Classroom ID already exists. Please use another ID.')
        } else {
          alert('Failed to save classroom. Try again.')
        }
        console.error('Failed to save classroom:', err?.response?.data || err?.message)
      }
    },

    async handleDelete(room) {
      try {
        await deleteClassroom(room.classroomID)
        this.classrooms = this.classrooms.filter(r => r.classroomID !== room.classroomID)
        this.closeModal('delete-classroom')
      } catch (err) {
        console.error('Failed to delete classroom:', err?.response?.data || err?.message)
        alert('Failed to delete classroom. Try again.')
      }
    },

    handleEnrol(classroom) {
      console.log('Student enrolled in:', classroom)
      this.selectedClassroom = null
    },
  },
}
</script>