<template>
  <!-- Bootstrap modal -->
  <div class="modal fade" id="enrol-course" tabindex="-1" role="dialog" aria-labelledby="enrolCourseTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="enrolCourseTitle">Enrol in Course</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <form @submit.prevent="confirmEnrol">
          <div class="modal-body">
            <h5>Are you sure you want to enrol in <strong>{{ courseName }}</strong>?</h5>
          </div>

          <!-- Buttons to cancel or confirm -->
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
import { Icon } from '@iconify/vue'
import { enrollInCourse } from '../api';

export default {
  name: "courseEnrolModal",
  components: { Icon },
  props: {
    courseToEnrol: {
      type: Object,
      default: null
    }
  },
  computed: {
    courseName() {
      return this.courseToEnrol?.title || "this course";
    }
  },
  methods: {
    async confirmEnrol() {
    try {
      // Call API function with the course id
      console.log("courseToEnrol:", this.courseToEnrol);
      console.log("is null?", this.courseToEnrol === null);
      console.log("id:", this.courseToEnrol?.id);
      if (!this.courseToEnrol) return;

      // Load logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;   // the MongoDB ID
    
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }
      
      await enrollInCourse(this.courseToEnrol.id, userId); // or _id depending on your backend schema
      
      user.enrolledCourse = this.courseToEnrol._id;  // <-- add or overwrite

      // update local storage
      localStorage.setItem("user", JSON.stringify(user));
      // Optionally notify parent so it can refresh courses list
      this.$emit('enrol-course', this.courseToEnrol);

      // Close modal
      const modalEl = document.getElementById('enrol-course');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();

      window.location.reload();
      // Maybe show success feedback
      console.log(`Successfully enrolled in ${this.courseToEnrol.title}`);
      alert(`Successfully enrolled in ${this.courseToEnrol.title}`);
    } catch (error) {
      // console.error("Enrolment failed:", error);
      alert("You have already enrolled in a course!");
    }
  }
  }
}
</script>
