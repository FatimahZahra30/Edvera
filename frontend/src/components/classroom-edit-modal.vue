<template>
  <div class="modal fade" id="edit-classroom" tabindex="-1" role="dialog" aria-labelledby="editClassroomLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" id="editClassroomLabel">Edit Classroom</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Form -->
        <form @submit.prevent="submitEdit">
          <div class="modal-body">
            <!-- Classroom Name -->
            <div class="form-group mb-3">
              <label for="classroom-name" class="col-form-label">Classroom Name:</label>
              <input type="text" class="form-control" id="classroom-name" v-model.trim="local.name" required />
            </div>

            <!-- Classroom ID -->
            <div class="form-group mb-3">
              <label for="classroom-id" class="col-form-label">Classroom ID:</label>
              <input type="text" class="form-control" id="classroom-id" v-model.trim="local.classroomID" required disabled />
            </div>

            <!-- Description -->
            <div class="form-group mb-3">
              <label for="course-description" class="col-form-label">Description:</label>
              <textarea class="form-control" id="classroom-description" v-model="local.description"></textarea>
            </div>

            <!-- Supervisor Email -->
            <div class="form-group mb-3">
              <label for="col-form-label">Supervisor (Owner):</label>
              <select id="creator" class="form-select" v-model="local.supervisor" required>
                <option value="" disabled>Select a supervisor</option>
                <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
                  {{ s.firstName }} {{ s.lastName }} ({{ s.email }})
                </option>
              </select>
            </div>

            <!-- Status -->
            <div class="form-group mb-3">
              <label for="status" class="col-form-label">Status:</label>
              <select id="status" class="form-select" v-model="local.status" required>
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <!-- Start Date (must be after today) -->
            <div class="form-group mb-3">
              <label for="start-date" class="col-form-label">Start Date:</label>
              <input
                type="date"
                class="form-control"
                id="start-date"
                v-model="local.startDate"
                :min="minStartDate"
                @change="validateStartDate"
                :class="{'is-invalid': !!startDateError}"
                required
              />
              <div class="invalid-feedback" v-if="startDateError">{{ startDateError }}</div>
            </div>

            <!-- Duration (+ live End Date) -->
            <div class="form-group mb-1">
              <label class="col-form-label">Duration → End Date:</label>
              <div class="d-flex gap-2">
                <input
                  type="number"
                  min="1"
                  step="1"
                  class="form-control"
                  style="max-width: 160px"
                  v-model.number="durationValue"
                  required
                />
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
              <label for="col-form-label">Associated Course:</label>
              <select class="form-select" 
              v-model="local.associatedCourse" 
              @change="
              showLessons(local.associatedCourse);
              showStudents(local.associatedCourse)" required>
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
                  <li v-for="lesson in lessonsForEdit" :key="`lesson-${lesson._id}`" class="mb-2">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox"
                        :value="lesson._id" 
                        v-model="local.selectedLessons" 
                        :id="`lesson-${lesson._id}`">
                      <label class="form-check-label" :for="`lesson-${lesson._id}`">
                        {{ lesson.name }} - {{ lesson.credit }} credits
                      </label>
                    </div>
                  </li>
                </ul>
                <div v-if="!lessonsForEdit.length" class="small text-muted">No lessons available</div>
              </div>
            </div>

          <!-- Selected Students -->
          <div class="form-group mb-3">
            <label class="col-form-label">Select Students:</label>
            <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
              <ul class="list-unstyled mb-0">
                <li v-for="student in courseStudents" :key="`student-${student._id}`" class="mb-2">
                  <div class="form-check">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      :id="`student-${student._id}`" 
                      :value="student._id"
                      v-model="local.students"
                    >
                    <label class="form-check-label" :for="`student-${student._id}`">
                      {{ student.email }}
                    </label>
                  </div>
                </li>
              </ul>
              <div v-if="!courseStudents.length" class="small text-muted">No students available</div>
            </div>
          </div>
          </div>
          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
label.col-form-label { text-align:left; display:block; }
/* highlight invalid date */
.is-invalid { border-color: #dc3545; }
.is-invalid:focus { box-shadow: 0 0 0 .25rem rgba(220,53,69,.25); }
</style>

<script>
/* global bootstrap */
import { getCourseById, getSupervisors } from "../api"

export default {
  name: 'classroomEditModal',
  emits: ['classroom-updated'],
  props: {
    classroom: { type: Object, default: null },
    allClassrooms: { type: Array, default: () => [] },
    allCourses: { type: Array, default: () => [] },
    allLessons: { type: Array, default: () => [] },
    //allSupervisors: { type: Array, default: () => [] },
  },
  data() {
    return {
      local: this.classroom ? { ...this.classroom } : this.empty(),
      // duration controls
      durationValue: 6,
      durationUnit: 'weeks',
      // bindable lists
      lessonsForEdit: [],
      courseStudents: [],
      courseLessons: [],
      // validation
      startDateError: '',
      minStartDate: this.tomorrowISO(),
      allSupervisors: []
    }
  },
  computed: {
    computedEndDate() {
      const start = new Date(this.local.startDate)
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
      if (!this.local.startDate) return false;
      const today = new Date();
      today.setHours(0,0,0,0);
      const startDate = new Date(this.local.startDate);
      startDate.setHours(0,0,0,0);
      return startDate <= today;
  }
  },
  async mounted() {
    if (this.local.associatedCourse) {
      this.showLessons(this.local.associatedCourse)
      this.showStudents(this.local.associatedCourse)
    }
    
    const user = JSON.parse(localStorage.getItem("user"))
    if (user) this.local.supervisor = user.email

    const res = await getSupervisors();
    this.allSupervisors = res.data
  },
  watch: { 
    classroom: {
      deep: true,
      immediate: true,
      async handler(val) {
        console.log("Incoming classroom data:",val);
        if (!val) {
          this.local = this.empty();
          return
        }

        this.local = JSON.parse(JSON.stringify(val));

        if (this.local.startDate && this.local.startDate.includes("T")) {
          this.local.startDate = this.local.startDate.slice(0,10);
        }

        if (Array.isArray(this.local.associatedCourse)) {
          this.local.associatedCourse = this.local.associatedCourse[0]?._id || this.local.associatedCourse[0] || '';
        } else if (typeof this.local.associatedCourse === "object" && this.local.associatedCourse._id) {
          this.local.associatedCourse = this.local.associatedCourse._id;
        }
        const prevSelected = Array.isArray(this.local.students)? this.local.students.map(s =>
            typeof s === "object" && s._id ? String(s._id) : String(s))
        : [];
        this.handleDuration(val);
        this.startDateError = "";
        this.minStartDate = this.tomorrowISO();

        if (this.local.associatedCourse) {
          await this.showLessons(this.local.associatedCourse);
          await this.$nextTick();
          await this.showStudents(this.local.associatedCourse);
          await this.$nextTick();
        }

        await this.$nextTick();

        this.local.students = prevSelected;
        console.log("Reapplied selected students:",this.local.students);
      }
    }
  },
  methods: {
    empty() {
      return {
        classroomID: '',
        name: '',
        description: '',
        supervisor: '',
        status: 'Draft',
        startDate: '',
        associatedCourse: '',
        duration: { value: 6, unit: 'weeks' },
        selectedLessons: [],
        studentCount: 0,
        courseStudents: [],
        students: [],
        allSupervisors: [],
      }
    },
    handleDuration(val) {
      const dur = val?.duration 
      if (!dur) {
        this.durationValue = 6;
        this.durationUnit = "weeks";
        return;
      }

      if (typeof dur === 'object') {
        this.durationValue = Number(dur.value || 6)
        this.durationUnit = dur.unit || 'weeks'
      } else if (typeof dur === 'string'){
        const m =dur.trim().match(/^(\d+)\s*(day|week|month)s?$/i)
        if (m) {
          this.durationValue = Number(m[1])
          const unit = m[2].toLowerCase();
          this.durationUnit = unit.endsWith('s') ? unit : unit + 's';
        } else {
          this.durationValue = 6;
          this.durationUnit = "weeks";
        }
      } else if (typeof dur === "number") {
        this.durationValue = dur || 6;
        this.durationUnit = "days";
      }
    },
async showLessons(courseId) {
  if (!courseId) {
    this.lessonsForEdit = [];
    return;
  }
  try {
    const res = await getCourseById(courseId);
    const fetchedLessons = (res?.data?.lessons || []).map(l => ({ ...l, _id: String(l._id) }));
    this.lessonsForEdit = fetchedLessons;

    // Preserve previously selected lessons
    if (Array.isArray(this.local.selectedLessons)) {
      const prevLessons = this.local.selectedLessons.map(String);
      this.local.selectedLessons = fetchedLessons
        .filter(l => prevLessons.includes(l._id))
        .map(l => l._id);
    }

    console.log("Lessons for edit:", this.lessonsForEdit);
    console.log("Selected lessons:", this.local.selectedLessons);
  } catch (err) {
    console.error(`Failed to fetch lessons for course ${courseId}:`, err?.response?.data || err?.message);
    this.lessonsForEdit = [];
  }
},
async showStudents(courseId){
  if(!courseId) {
    this.courseStudents = [];
    return;
  }
  try {
    const res = await getCourseById(courseId);
    const fetchedStudents = (res?.data.enrolledStudents || []).map(s=>({
      ...s,_id:String(s._id)
    }));
    this.courseStudents = fetchedStudents;

    if (Array.isArray(this.local.students)){
      const prev = this.local.students.map(String);
      this.local.students = fetchedStudents.filter(s=>prev.includes(s._id)).map(s=>s._id);
    }
    console.log("Loaded course students:", this.courseStudents);
    console.log("Selected students (checked):", this.local.students);
  } catch (err) {
    console.error(`Failed to fetch students for course ${courseId}:`, err?.response?.data || err?.message);
    this.courseStudents = [];
  }
},

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
      this.startDateError = this.isAfterToday(this.local.startDate)
        ? ''
        : 'Start date must be after today.'
    },

    submitEdit() {
      if (!Array.isArray(this.local.students)) this.local.students = []
      // HARD GUARD: block save if invalid start date
      if (!this.isAfterToday(this.local.startDate)) {
        this.startDateError = 'Start date must be after today.'
        return
      }

      let durationInDays = this.durationValue
      if (this.durationUnit === "weeks")  durationInDays *= 7
      if (this.durationUnit === "months") durationInDays *= 30

      const payload = {
        classroomID: this.local.classroomID,
        name: this.local.name,
        description: this.local.description,
        supervisor: this.local.supervisor,
        status: this.local.status,
        startDate: this.local.startDate,
        duration: durationInDays,
        endDate: this.computedEndDate?.toISOString?.() || this.computedEndDate,
        associatedCourse: this.local.associatedCourse,
        selectedLessons: this.local.selectedLessons,
        students: this.local.students.map(String),
      }

      this.$emit('classroom-updated', payload)

      const modalEl = document.getElementById('edit-classroom')
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl)
      modal.hide()
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove())
      document.body.classList.remove('modal-open')

      // setTimeout(() => { window.location.reload() }, 400)
    },

    // helpers
    parseDate(d) {
      if (!d) return null
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? null : dt
    },
    prettyDate(d) {
      const dt = this.parseDate(d) || (d instanceof Date ? d : null)
      const date = dt instanceof Date ? dt : null
      return date ? date.toLocaleDateString(undefined, { year:'numeric', month:'long', day:'numeric' }) : ''
    },
    renderLesson(lesson) {
      if (!lesson) return ''
      if (typeof lesson === 'string') return lesson
      return lesson.title || lesson.name || lesson.id || ''
    }
  }
}
</script>