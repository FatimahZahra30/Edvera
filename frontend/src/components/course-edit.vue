<template>
  <!-- Bootstrap modal -->
  <div class="modal fade" id="edit-course" tabindex="-1" role="dialog" aria-labelledby="editCourseLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg" role="document">
      <div class="modal-content">

        <!-- Header -->
        <div class="modal-header">
          <h5 class="modal-title" id="editCourseLabel">Edit Course</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveChanges">
          <div class="modal-body">

            <!-- Core Information -->
            <div class="form-group mb-3">
              <label for="course-id" class="col-form-label">Course ID:</label>
              <input type="text" class="form-control" id="course-id" v-model="form.id" disabled>
            </div>

            <div class="form-group mb-3">
              <label for="course-title" class="col-form-label">Title:</label>
              <input type="text" class="form-control" id="course-title" v-model="form.title" required>
            </div>

            <div class="form-group mb-3">
              <label for="course-description" class="col-form-label">Description:</label>
              <textarea class="form-control" id="course-description" v-model="form.description" required></textarea>
            </div>

            <!-- Lessons -->
            <div class="form-group mb-3" data-bs-display="static">
              <label class="col-form-label">Lessons (select any):</label>
              <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;"> 
                <ul class="list-unstyled mb-0">
                  <li v-for="lesson in allLessons" :key="lesson._id" class="mb-2">
                    <div class="form-check">
                      <input 
                        class="form-check-input" 
                        type="checkbox" 
                        :value="lesson._id" 
                        v-model="form.lessonIDs" 
                        :id="`lesson-${lesson._id}`">
                      <label class="form-check-label" :for="`lesson-${lesson._id}`">
                        {{ lesson.name }}
                      </label>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Status -->
            <div class="form-group mb-3">
              <label for="status" class="col-form-label">Status:</label>
              <select id="status" name="status" class="form-select" v-model="form.status" required>
                <option value="" disabled>Select Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <!-- Supervisor Email -->
            <div class="form-group mb-3">
              <label for="col-form-label">Supervisor (Owner):</label>
              <select id="creator" class="form-select" v-model="form.supervisor" required>
                <option value="" disabled>Select a supervisor</option>
                <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
                  {{ s.firstName }} {{ s.lastName }} ({{ s.email }})
                </option>
              </select>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" data-bs-dismiss="modal">Save Changes</button>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>

<style scoped>
.dropdown-toggle {
  border-color: #ced4da !important;
  background-color: #fff !important;
  color: #000 !important;
  width: 100%;
  text-align: left !important;
}
.dropdown-toggle:focus {
  border-color: #86b7fe !important;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
}
.dropdown-toggle:active {
  box-shadow: none;
  color: #000;
}
label.col-form-label {
  text-align: left;
  display: block;
}
</style>

<script>
import { updateCourse, getSupervisors } from "../api"; 

export default {
  name: "courseEditModal",
  props: {
    course: { type: Object, required: true }, // course passed in from parent
    allLessons: { type: Array, default: () => [] },
    //allSupervisors: { type: Array, default: () => [{email: 'test@gmail.com'}] } 
  },
  data() {
    return {
      form: { ...this.course }, // local copy for editing
      allSupervisors: []
    };
  },
  watch: {
    course(newCourse) {
      this.form = { ...newCourse, 
        lessonIDs: newCourse.lessons.map(l => l._id)
      }; // update local form when prop changes
      //console.log(this.form)
      console.log("Lessons in this.form", this.form.lessons);
      console.log("All lessons", this.allLessons)


    }
  },
  async mounted(){
    const res = await getSupervisors();
    this.allSupervisors = res.data

  },
  methods: {
    async saveChanges() {
      try {
        const res = await updateCourse(this.form.id, this.form);
        this.$emit("course-updated", res.data.updatedCourse ?? this.form);
        const modalEl = document.getElementById("edit-course");
        bootstrap.Modal.getInstance(modalEl).hide();
        modalEl.hide()
      } catch (err) {
        console.error("Failed to update course:", err.response?.data || err.message);
      }
    }
  }
};
</script>
