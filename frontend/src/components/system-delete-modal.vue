<template>
    <!--template from bootstrap for the modal-->
    <div class="modal fade" id="delete-user" tabindex="-1" role="dialog" aria-labelledby="deleteUserLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"> Delete {{ userType === "student" ? "Student" : "Instructor" }} </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <p class="mb-2">
            Are you sure you want to delete
            <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>?
          </p>

          <div v-if="userToDelete" class="small border rounded p-2 bg-light">
            <div><strong>Email:</strong> {{ userToDelete.email || "—" }}</div>
            <div><strong>Role:</strong> {{ userType }}</div>
          </div>
        </div>

      <!-- Buttons to cancel or save the change-->
      <div class="modal-footer d-flex justify-content-end">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" @click="confirmDelete">Confirm</button>
        <!-- <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Confirm</button> -->
      </div>
    </div>
  </div>
</div>
</template>


<script>
/* global bootstrap */

export default {
  name: "SystemDeleteModal",
  props: {
    userToDelete: { type: Object, default: null },
    userType: { type: String, default: "user" },
  },
  methods: {
    confirmDelete() {
      if (!this.userToDelete) return;
      this.$emit("delete-user", this.userToDelete);
      const modal = bootstrap.Modal.getInstance(document.getElementById("delete-user"));
      modal?.hide();
    },
  },
};
</script>
