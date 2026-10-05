<template>
  <teleport to="body">
  <!-- Template from bootstrap for the modal-->
  <div class="modal fade" id="edit-lesson" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">

        <!--Creates the cross button to cancel-->
        <div class="modal-header">
          <h5 class="modal-title">Edit Lesson</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Creates the form with questionaire-->
        
        <form @submit.prevent="saveChanges">
            <div class="modal-body">
        <div class="form-group">
            <label for="lesson-name" class="col-form-label">Lesson Name:</label>
            <input type="text" class="form-control" id="lesson-name" v-model="form.name" required>
        </div>

        <div class="form-group">
            <label for="lesson-id" class="col-form-label">Lesson ID:</label>
            <input type="text" class="form-control" id="lesson-id" v-model="form.id" disabled>
        </div>

        <div class="form-group">
        <label for="description-text" class="col-form-label">Lesson Description:</label>
        <textarea class="form-control" id="description-text" v-model="form.description"required></textarea>
        </div>

        <!-- Supervisor -->
        <div class="form-group mb-3">
          <label for="col-form-label" @click="console.log('All Supervisors:', allSupervisors, 'Pre-Selected:', form.creator)">Supervisor (Owner):</label>
          <select id="creator" class="form-select" v-model="form.creator" required>
            <option value="" disabled>Select a supervisor</option>
            <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
              {{ s.email }}
            </option>
          </select>
        </div>
        <!-- <div class="form-group">
            <label for="creator" class="col-form-label">Instructor Name:</label>
            <input type="text" class="form-control" id="creator" v-model="form.creator" required>
        </div> -->

        <div class="form-group">
            <label for="credit" class="col-form-label">Credit Points:</label>
            <input type="number" class="form-control" id="credit" v-model.number="form.credit" required>
        </div>

        <div class="form-group">
            <label for="status" class="col-form-label">Status:</label>
            <select id="status" name="status" class="form-select" v-model="form.status" required>
            <option value="" disabled>Select Status</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
            </select>
        </div>
        

        <div class="form-group mb-3" data-bs-display="static">
          <label class="col-form-label" @click="console.log('All lessons:', allLessons, 'Pre-Selected:', form.prerequisites)">Prerequisite Lessons:</label>
          <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
            <ul class="list-unstyled mb-0">
              <li v-for="lesson in allLessons" :key="lesson._id" class="mb-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :value="lesson._id" 
                    v-model="selectedLessonIds" 
                    :id="`lesson-${lesson._id}`">
                  <label class="form-check-label" :for="`lesson-${lesson._id}`">
                    {{ lesson.name }}
                  </label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- <div class="form-group">
            <label class="col-form-label">Prerequisite Lessons:</label>
            <div class="dropdown">
                <button class="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Select prerequisites
                </button>
                <ul class="dropdown-menu p-3" style="min-width: 250px;">
                  <li v-for="lessonItem in allLessons" :key="lessonItem.id">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" :value="lessonItem.id" v-model="form.prerequisites" :id="`prereq-${lessonItem.id}`">
                      <label class="form-check-label" :for="`prereq-${lessonItem.id}`">{{lessonItem.name}}</label>
                    </div>
                  </li>
                </ul>
            </div>
        </div> -->

        <div class="form-group">
        <label for="reading-text" class="col-form-label">Reading List:</label>
        <textarea class="form-control" id="reading-text" v-model="form.reading"></textarea>
        </div>
        <div class="form-group">
        <label for="assignment-text" class="col-form-label">Assignment:</label>
        <textarea class="form-control" id="assignment-text" v-model="form.assignment"></textarea>
        </div>


        <!-- Buttons to cancel or save the change-->
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
        </div>

        </form>
        
      </div>
    </div>
  </div>
  </teleport>
</template>

<script>
import { Icon } from '@iconify/vue'
import { updateLesson, getSupervisors } from "../api";

export default {
  name: "lessonEditModal",
  emits: ['lessonUpdated'],
  components: { Icon, getSupervisors },
  props: {
    lesson: { type: [Object, null], required: true }, // lesson passed in from parent
    allLessons: { type: Array,default: () => [] },
  },
  data() {
    return {
      form: { ...this.lesson }, // copy lesson into local form state
      allSupervisors: '',
      selectedLessonIds: []
    };
  },
  computed: {
    selectedLessonIds: {
    get() {
      return this.form.prerequisites?.map(l => l._id) || [];
    },
    set(ids) {
      this.form.prerequisites = this.allLessons.filter(
        lesson => ids.includes(lesson._id)
      );
    }
  }
  },
  watch: {
    lesson(newLesson) {
      this.form = { ...newLesson }; // update when parent changes
    },
  },
  async mounted() {
    const res = await getSupervisors();
    this.allSupervisors = res.data;
  },
  methods: {
    updatePrerequisites() { 
      this.form.prerequisites = this.allLessons.filter(
        lesson => this.selectedLessonIds.includes(lesson._id)
      )
    },  
    async saveChanges() {
      try {
        const rest = await updateLesson(this.form.id,this.form);
        this.$emit("lesson-updated",rest.data.updatedLesson ?? this.form);
        const modalEl = document.getElementById("edit-lesson");
        bootstrap.Modal.getInstance(modalEl).hide();
      } catch (err) {
        console.error("Failed to update lesson:", err.response?.data || err.message);
      }
    },
  },
}
</script>

<style>
.dropdown-toggle {
  border-color: #ced4da !important;  
  background-color: #fff !important;   
  color: #000 !important;          
  width: 100%;              
  text-align: left !important;        
}

/* manually creates the bootstrap blue glow */
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
  display: block; /* ensures the label takes full width */
}
</style>