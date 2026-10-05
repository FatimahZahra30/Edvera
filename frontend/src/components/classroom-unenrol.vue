<template>
  <!-- Bootstrap modal -->
  <div class="modal fade" id="unenrol-classroom" tabindex="-1" role="dialog" aria-labelledby="UnenrolClassroomTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="UnenrolClassroomTitle">Unenrol from Classroom</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <form @submit.prevent="confirmUnenrol">
          <div class="modal-body">
            <h5>
              Are you sure you want to unenrol from
              <strong>{{ classroomName }}</strong>?
            </h5>
          </div>

          <!-- Buttons to cancel or confirm -->
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button type="submit" class="btn btn-danger">Confirm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { unenrolStudentFromClassroom } from "../api";

export default {
  name: "ClassroomUnenrol",
  props: {
    classroomToUnenrol: {
      type: Object,
      default: null,
    },
  },
  computed: {
    classroomName() {
      return this.classroomToUnenrol?.name || "this classroom";
    },
  },
  methods: {
    async confirmUnenrol() {
      try {
        if (!this.classroomToUnenrol) return;

        // Get user info
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user?._id;
        if (!userId) {
          console.error("No user ID found in localStorage");
          return;
        }

        // Call backend API
        await unenrolStudentFromClassroom(this.classroomToUnenrol.classroomID, userId);

        // Optional: remove classroom locally (not required)
        this.$emit("unenrol-classroom", this.classroomToUnenrol);

        // Close modal
        const modalEl = document.getElementById("unenrol-classroom");
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.hide();

        // Reload page or refresh list
        window.location.reload();

        alert(`Successfully unenrolled from ${this.classroomToUnenrol.name}`);
      } catch (error) {
        console.error("Unenrolment failed:", error);
        alert("Error unenrolling from classroom!");
      }
    },
  },
};
</script>
