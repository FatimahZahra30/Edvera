<template>
  <!-- Bootstrap modal -->
  <div class="modal fade" id="unenrol-course" tabindex="-1" role="dialog" aria-labelledby="UnenrolCourseTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="UnenrolCourseTitle">Unenrol in Course</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <form @submit.prevent="confirmUnenrol">
          <div class="modal-body">
            <h5>Are you sure you want to unenrol in <strong>{{ courseName }}</strong>?</h5>
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
import { unenrollInCourse } from '../api';

export default {
  name: "courseUnenrolModal",
  components: { Icon },
  props: {
    courseToUnenrol: {
      type: Object,
      default: null
    }
  },
  computed: {
    courseName() {
      return this.courseToUnenrol?.title || "this course";
    }
  },
  methods: {
    async confirmUnenrol() {
    try {
      // Call API function with the course id
    //   console.log("courseToEnrol:", this.courseToEnrol);
    //   console.log("is null?", this.courseToEnrol === null);
    //   console.log("id:", this.courseToEnrol?.id);
      if (!this.courseToUnenrol) return;

      // Load logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id;   // the MongoDB ID
    
    if (!userId) {
      console.error("No user ID found in localStorage");
      return;
    }
      
      await unenrollInCourse(this.courseToUnenrol.id, userId); // or _id depending on your backend schema
      
      user.enrolledCourse = null;  // overwrite current course

      // update local storage
      localStorage.setItem("user", JSON.stringify(user));
      // Optionally notify parent so it can refresh courses list
      this.$emit('unenrol-course', this.courseToUnenrol);

      // Close modal
      const modalEl = document.getElementById('unenrol-course');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();

      window.location.reload();
      // Maybe show success feedback
      console.log(`Successfully unenrolled in ${this.courseToUnenrol.title}`);
      alert(`Successfully unenrolled in ${this.courseToUnenrol.title}`);
    } catch (error) {
      // console.error("Enrolment failed:", error);
      alert("Error unenrolling!");
    }
  }
  }
}
</script>
