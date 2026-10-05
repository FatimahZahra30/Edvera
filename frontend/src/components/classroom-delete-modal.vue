<template>
  <div class="modal fade" id="delete-classroom" tabindex="-1" role="dialog" aria-labelledby="deleteClassroomLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" id="deleteClassroomLabel">Delete Classroom</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <p class="mb-2">
            Are you sure you want to delete
            <strong>{{ classroomToDelete?.name || 'this classroom' }}</strong>?
            This action cannot be undone.
          </p>

          <!-- Compact details preview -->
          <div v-if="classroomToDelete" class="small border rounded p-2 bg-light">
            <div><strong>ID:</strong> {{ classroomToDelete.classroomID || '—' }}</div>
            <div><strong>Supervisor:</strong> {{ classroomToDelete.supervisor || '—' }}</div>
            <div><strong>Status:</strong> {{ classroomToDelete.status || 'Draft' }}</div>
            <div>
              <strong>Start:</strong> {{ prettyDate(classroomToDelete.startDate) || '—' }}
              <template v-if="endDate">
                &nbsp;→ <strong>End:</strong> {{ prettyDate(endDate) }}
              </template>
            </div>
            <div><strong>Associated Course:</strong> 
              <span v-if="classroomToDelete.associatedCourse?.length">
                {{ associatedCourseName }}
              </span>
            </div>
            <div><strong>Selected Lessons:</strong> {{ lessonsCount }}</div>
            <div><strong>Students:</strong> {{ studentCount }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <p v-if="studentCount > 0" class="text-danger small mb-2 text-center">
            Cannot delete - there are {{ studentCount }} student(s) enrolled.
          </p>
          <div class="d-flex justify-content-end w-100">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" @click="confirmDelete" :disabled="studentCount > 0">Delete</button>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/* global bootstrap */

import { getAllCourses } from '../api';

export default {
  name: 'classroomDeleteModal',
  emits: ['delete-classroom'],
  props: {
    classroomToDelete: { type: Object, default: null }
  },
  data() {
    return {
      courses: []
      }
    },
  async mounted() {
    try {
      const res = await getAllCourses()
      this.courses = res.data || []
    } catch (err) {
      console.error("Failed to fetch courses",err)
    }
  },
  computed: {
    lessonsCount() {
      const v = this.classroomToDelete?.selectedLessons
      if (!v) return 0
      if (Array.isArray(v)) return v.length
      if (typeof v === 'string') {
        return v.split('\n').map(s => s.trim()).filter(Boolean).length
      }
      return 0
    },
    endDate() {
      const cls = this.classroomToDelete
      if (!cls) return null
      const start = this.parseDate(cls.startDate)
      const dur = cls.duration
      if (!start || !dur) return null

      let value = 0
      let unit = 'days'
      if (typeof dur === 'string') {
        const m = dur.trim().match(/^(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)$/i)
        if (m) { value = Number(m[1]); unit = m[2].toLowerCase() }
      } else if (typeof dur === 'object') {
        value = Number(dur.value || 0)
        unit = String(dur.unit || 'days').toLowerCase()
      }
      if (!value) return null

      const end = new Date(start.getTime())
      if (unit.startsWith('day')) end.setDate(end.getDate() + value)
      else if (unit.startsWith('week')) end.setDate(end.getDate() + value * 7)
      else if (unit.startsWith('month')) end.setMonth(end.getMonth() + value)
      else end.setDate(end.getDate() + value)
      return end
    },
    associatedCourseName(){
    if (!this.classroomToDelete?.associatedCourse?.length || !this.courses.length) return "Unknown Course"

    const courseId = this.classroomToDelete.associatedCourse[0]
    const match = this.courses.find(c => c._id === courseId || c._id.toString() === courseId.toString())
    return match ? match.title : "Unknown Course"
  },
  studentCount() {
    const s = this.classroomToDelete?.students
    return Array.isArray(s) ? s.length : 0
  },
  },
  methods: {
    confirmDelete() {
      if (!this.classroomToDelete) return
      if (this.studentCount > 0) {
        alert(`Cannot delete classroom — there are ${this.studentCount} students enrolled.`);
        return;
      }
      this.$emit('delete-classroom', this.classroomToDelete)
      const el = document.getElementById('delete-classroom')
      const modal = bootstrap.Modal.getOrCreateInstance(el)
      modal.hide()
      window.location.reload(true)
    },
    parseDate(d) {
      if (!d) return null
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? null : dt
    },
    prettyDate(d) {
      const dt = this.parseDate(d) || (d instanceof Date ? d : null)
      return dt ? dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''
    }
  }
}
</script>
