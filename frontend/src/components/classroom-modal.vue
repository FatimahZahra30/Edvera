<template>
  <!-- Bootstrap modal -->
   <teleport to="body">
  <div class="modal fade" id="add-classroom" tabindex="-1" role="dialog" aria-labelledby="addClassroomLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" id="addClassroomLabel">New Classroom</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitClassroom">
          <div class="modal-body">
            <!-- Classroom Name -->
            <div class="form-group mb-3">
              <label for="classroom-name" class="col-form-label">Classroom Name:</label>
              <input type="text" class="form-control" id="classroom-name" v-model.trim="localClassroom.name" required />
            </div>

            <!-- Classroom ID -->
            <div class="form-group mb-3">
              <label for="classroom-id" class="col-form-label">Classroom ID:</label>
              <input type="text" class="form-control" id="classroom-id" v-model.trim="localClassroom.id" required />
            </div>

            <!-- Description -->
            <div class="form-group mb-3">
              <label for="course-description" class="col-form-label">Description:</label>
              <textarea class="form-control" id="classroom-description" v-model="localClassroom.description"></textarea>
            </div>

            <!-- Supervisor Email -->
            <div class="form-group mb-3">
              <label for="col-form-label">Supervisor (Owner):</label>
              <select id="creator" class="form-select" v-model="localClassroom.supervisor" required>
                <option value="" disabled>Select a supervisor</option>
                <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
                  {{ s.firstName }} {{ s.lastName }} ({{ s.email }})
                </option>
              </select>
            </div>

            <!-- Status -->
            <div class="form-group mb-3">
              <label for="status" class="col-form-label">Status:</label>
              <select id="status" class="form-select" v-model="localClassroom.status" required>
                <option value="" disabled>Select Status</option>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <!-- Start Date -->
            <div class="form-group mb-3">
              <label for="start-date" class="col-form-label">Start Date:</label>
              <input
                type="date"
                class="form-control"
                id="start-date"
                v-model="localClassroom.startDate"
                :min="minStartDate"
                @change="validateStartDate"
                :class="{'is-invalid': !!startDateError}"
                required
              />
              <div class="invalid-feedback" v-if="startDateError">{{ startDateError }}</div>
            </div>

            <!-- Duration -->
            <div class="form-group mb-1">
              <label class="col-form-label">Duration → End Date:</label>
              <div class="d-flex gap-2">
                <input type="number" min="1" step="1" class="form-control" style="max-width: 160px" v-model.number="durationValue" required />
                <select class="form-select" style="max-width: 180px" v-model="durationUnit" required>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                </select>
              </div>
            </div>
            <div class="small text-muted mb-3" v-if="computedEndDate">
              End Date: <strong>{{ prettyDate(computedEndDate) }}</strong>
            </div>

            <!-- Associated Course -->
            <div class="form-group mb-3">
              <label class="col-form-label">Associated Course:</label>
              <select class="form-select" v-model="localClassroom.associatedCourse" required>
                <option value="" disabled>Select a course</option>
                <option v-for="c in allCourses" :key="c._id" :value="c._id">
                  {{ c.title }}
                </option>
              </select>
            </div>

            <!-- Selected Lessons -->
            <div class="form-group mb-3">
              <label class="col-form-label">Selected Lessons:</label>
              <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                <ul class="list-unstyled mb-0">
                  <li v-for="lesson in courseLessons" :key="lesson._id" class="mb-2">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :value="lesson._id" 
                        v-model="localClassroom.selectedLessons" 
                        :id="`lesson-${lesson._id}`">
                      <label class="form-check-label" :for="`lesson-${lesson._id}`">
                        {{ lesson.name }} - {{ lesson.credit }} credits
                      </label>
                    </div>
                  </li>
                </ul>
                <div v-if="!courseLessons.length" class="small text-muted">No lessons available</div>
              </div>
            </div>

            <!-- Select Students-->
            <div class="form-group mb-3">
                <label class="col-form-label">Select Students:</label>
                <div v-for="student in courseStudents" :key="student._id" class="form-check">
                  <input class="form-check-input" type="checkbox" :id="'student-'+student._id" :value="student._id" v-model="localClassroom.selectedStudents" :disabled="isStarted"/>
                  <label class="form-check-label" :for="'student-'+student._id">
                    {{ student.email }}
                  </label>
                </div>
              <div v-if="!courseStudents.length" class="small text-muted">No students available.</div>
              <div v-if="isStarted" class="small text-muted">Classroom has started. New student enrolments are disabled.</div>
            </div>
          
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary">Create Classroom</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </teleport>
</template>

<script>
/* global bootstrap */
import { getAllCourses, getCourseById, getSupervisors } from "../api"

export default {
  name: 'classroomModal',
  emits: ['add-classroom'],
  props: {
    allClassrooms: { type: Array, default: () => [] },
    // allSupervisors: {
    //   type: Array,
    //   default: () => [
    //     { email: 'placeholderEmail@gmail.com' },
    //     { email: 'supervisorsAreNotLoading@gmail.com' },
    //     { email: '2@gmail.com' },
    //     { email: 'default@gmail.com' },
    //   ]
    // },
  },
  data() {
    return {
      allCourses: [],
      courseLessons: [],
      localClassroom: {
        id: '',
        description: '',
        name: '',
        supervisor: '',
        status: '',
        startDate: this.tomorrowISO(),
        associatedCourse: '',
        selectedLessons: [],
        selectedStudents: [],
      },
      courseStudents: [],
      durationValue: 6,
      durationUnit: 'weeks',
      selectedLessonsText: '',
      // NEW: validation state
      startDateError: '',
      minStartDate: this.tomorrowISO(),
      allSupervisors: []
    }
  },
  computed: {
    computedEndDate() {
      const start = new Date(this.localClassroom.startDate)
      if (isNaN(start.getTime())) return null
      const v = this.durationValue
      if (!v) return null
      const end = new Date(start.getTime())
      if (this.durationUnit === 'days') end.setDate(end.getDate() + v)
      else if (this.durationUnit === 'weeks') end.setDate(end.getDate() + v * 7)
      else if (this.durationUnit === 'months') end.setMonth(end.getMonth() + v)
      return end
    },
    isStarted() {
      if (!this.localClassroom.startDate) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const startDate = new Date(this.localClassroom.startDate);
      startDate.setHours(0,0,0,0);
      return startDate <= today;
  }
  },
  watch: {
    "localClassroom.associatedCourse"(newVal) {
      this.showLessons(newVal)
      this.loadStudents() // keep students in sync if you re-enable that section
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem("user"))
    this.localClassroom.supervisor = user.email
    this.loadCourses()
    this.loadStudents()
    this.localClassroom.startDate = new Date(2029, 0, 1)
    console.log(this.localClassroom.startDate)

    const res = await getSupervisors();
    this.allSupervisors = res.data


  },
  methods: {
    // --- validation helpers ---
    tomorrowISO() {
      const t = new Date()
      t.setHours(0,0,0,0)
      t.setDate(t.getDate() + 1) // strictly after today
      return t.toISOString().slice(0,10)
    },
    isAfterToday(iso) {
      if (!iso) return false
      const sel = new Date(iso)
      const today = new Date()
      sel.setHours(0,0,0,0)
      today.setHours(0,0,0,0)
      return sel.getTime() > today.getTime()
    },
    validateStartDate() {
      this.startDateError = this.isAfterToday(this.localClassroom.startDate)
        ? ''
        : 'Start date must be after today.'
    },

    async loadStudents() {
  try {
    if (!this.localClassroom.associatedCourse) {
      this.courseStudents = []
      return
    }

    const res = await getCourseById(this.localClassroom.associatedCourse)
    console.log("Full API response data:", res.data);  // Log the entire data object

    // Check the response data to see if enrolledStudents is nested or missing
    if (res.data.enrolledStudents) {
      this.courseStudents = res.data.enrolledStudents
    } else {
      console.error("No enrolledStudents found in the response");
      this.courseStudents = []  // Ensure empty array if not found
    }

    console.log("Loaded students:", this.courseStudents);  // Log the students array

  } catch (err) {
    console.error("Failed to fetch students:", err.response?.data || err.message )
    this.courseStudents = []
  }
}
,
    async loadCourses() {
  try {
    const res = await getAllCourses(); // API call to fetch courses
    if (res && res.data) {
      this.allCourses = Array.isArray(res.data) ? res.data : [];
    } else {
      console.error("Failed to fetch courses:", res);
      this.allCourses = [];
    }
  } catch (err) {
    console.error("Failed to fetch courses:", err.response?.data || err.message);
  }
}
,
    async showLessons(courseId) {
      if(!courseId) {
        this.courseLessons = []
        return
      }
      try {
        const res = await getCourseById(courseId)
        this.courseLessons = res?.data?.lessons || []
      } catch (err){
        console.error(`Failed to fetch lessons for course ${courseId}:`, err?.response?.data || err?.message)
        this.courseLessons = []
      }
    },

    getLessonsForCourse(courseId) {
      const course = this.allCourses.find(c => c._id === courseId)
      return course?.lessons || []
    },

    submitClassroom() {
      // HARD GUARD: block submit if invalid start date
      if (!this.isAfterToday(this.localClassroom.startDate)) {
        this.startDateError = 'Start date must be after today.'
        return
      }

      let durationInDays = this.durationValue
      if (this.durationUnit === "weeks") durationInDays *= 7
      if (this.durationUnit === "months") durationInDays *= 30

      const payload = {
        classroomID: this.localClassroom.id,
        name: this.localClassroom.name,
        description: this.localClassroom.description,
        supervisor: this.localClassroom.supervisor,
        status: this.localClassroom.status,
        startDate: this.localClassroom.startDate,
        duration: durationInDays,
        endDate: this.computedEndDate?.toISOString?.() || this.computedEndDate,
        associatedCourse: this.localClassroom.associatedCourse,
        selectedLessons: this.localClassroom.selectedLessons,
        selectedStudents: this.localClassroom.selectedStudents,
      }

      this.$emit('add-classroom', payload)

      const modalEl = document.getElementById('add-classroom')
      bootstrap.Modal.getOrCreateInstance(modalEl).hide()
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
      document.body.classList.remove('modal-open')
      this.resetForm()
    },

    prettyDate(d) {
      return d ? d.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' }) : ''
    },
    resetForm() {
      this.localClassroom = {
        id:'', name:'', supervisor:'', status:'',
        startDate:'', associatedCourse: '', selectedLessons:[], selectedStudents:[]
      }
      this.durationValue = 6
      this.durationUnit = 'weeks'
      this.courseLessons = []
      this.startDateError = ''
    }
  }
}
</script>

<style>
label.col-form-label { text-align:left; display:block; }
/* small UX polish */
.is-invalid { border-color: #dc3545; }
.is-invalid:focus { box-shadow: 0 0 0 .25rem rgba(220,53,69,.25); }
</style>
