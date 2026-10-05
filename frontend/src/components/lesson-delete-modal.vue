<template>
  <teleport to="body">
    <!--template from bootstrap for the modal-->
    <div class="modal fade" id="delete-lesson" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLongTitle">Delete Lesson</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
        </button>
      </div>

      <form @submit.prevent="deleteLesson">
      <div class="modal-body">
        <h5>Are you sure you want to delete {{ lessonName }}?</h5>
      </div>

      <!-- Buttons to cancel or save the change-->
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Confirm</button>
        <!-- <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Confirm</button> -->
      </div>
      </form>
    </div>
  </div>
</div>
</teleport>
</template>

<script>
import { Icon } from '@iconify/vue'

export default {
  name: "lessonDeleteModal",
  components: { Icon },
   props: {
    lessonToDelete: { // the lesson object passed from parent
      type: Object,
      default: null
    }
  },
  computed:{
    lessonName() {
      return this.lessonToDelete?.name || "this lesson";
    }
  },
  methods: {
    deleteLesson() {
      // Emit event to parent
      this.$emit('delete-lesson', this.lessonToDelete);

      // Close the modal
      const modalEl = document.getElementById('delete-lesson');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();
    }
  }
}
</script>