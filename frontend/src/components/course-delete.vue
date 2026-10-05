<template>
  <!-- Bootstrap modal -->
  <div class="modal fade" id="delete-course" tabindex="-1" role="dialog" aria-labelledby="deleteCourseTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="deleteCourseTitle">Delete Course</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <form @submit.prevent="deleteCourse">
          <div class="modal-body">
            <h5>Are you sure you want to delete <strong>{{ courseName }}</strong>?</h5>
          </div>

          <!-- Buttons -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-danger">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { Icon } from '@iconify/vue'
import { removeCourse } from '../api';

export default {
  name: "courseDeleteModal",
  components: { Icon },
  props: {
    courseToDelete: { // course object passed from parent
      type: Object,
      default: null
    }
  },
  computed: {
    courseName() {
      return this.courseToDelete?.title || "this course";
    }
  },
  methods: {
  async deleteCourse() {
    if (!this.courseToDelete?.id) return;
    try {
      // Call API to delete course
      
      await removeCourse(this.courseToDelete.id);

      // Emit event to parent so they can update their list
      this.$emit('delete-course', this.courseToDelete);

      // Close modal
      const modalEl = document.getElementById('delete-course');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete course:', err);
      alert('There was an error deleting the course.');
    }
  }
}
}
</script>
