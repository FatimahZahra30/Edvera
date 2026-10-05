<template>
  <div class="modal fade" id="enrol-classroom" tabindex="-1" role="dialog" aria-labelledby="enrolClassroomTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="enrolClassroomTitle">Enrol in Classroom</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <form @submit.prevent="confirmEnrol">
          <div class="modal-body">
            <h5>Are you sure you want to enrol in <strong>{{ classroomName }}</strong>?</h5>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-success">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'
import { enrollInClassroom } from '../api'

export default {
  name: "ClassroomEnrol",
  props: {
    classroomToEnrol: {
      type: Object,
      default: null
    }
  },
  computed: {
    classroomName() {
      return this.classroomToEnrol?.name || "this classroom"
    }
  },
  methods: {
    async confirmEnrol() {
      try {
        console.log("classroomToEnrol:", this.classroomToEnrol)
        if (!this.classroomToEnrol) return

        const user = JSON.parse(localStorage.getItem("user"))
        const studentId = user?._id

        if (!studentId) {
          console.error("No user ID found in localStorage")
          return
        }

        await enrollInClassroom(this.classroomToEnrol.classroomID, studentId)

        this.$emit('enrol-classroom', this.classroomToEnrol)

        const modalEl = document.getElementById('enrol-classroom')
        const modal = Modal.getOrCreateInstance(modalEl)
        modal.hide()

        console.log(`Successfully enrolled in ${this.classroomToEnrol.name}`)
        alert(`Successfully enrolled in ${this.classroomToEnrol.name}`)

        setTimeout(() => window.location.reload(), 300)
      } catch (error) {
        console.error("Enrolment failed:", error)
        alert(error.response?.data?.error || "Enrolment failed!")
      }
    }
  }
}
</script>