<template>
  <teleport to="body">
  <!-- template from bootstrap for the modal-->
  <div class="modal fade" id="add-lesson" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">

        <!--Creates the cross button to cancel-->
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">New Lesson</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <!-- Creates the form with questionaire-->
        
        <form @submit.prevent="submitLesson">
            <div class="modal-body">
        <div class="form-group">
            <label for="lesson-name" class="col-form-label">Lesson Name:</label>
            <input type="text" class="form-control" id="lesson-name" v-model="localLesson.name" required>
        </div>

        <div class="form-group">
            <label for="lesson-id" class="col-form-label">Lesson ID:</label>
            <input type="text" class="form-control" id="lesson-id" v-model="localLesson.id" required>
        </div>

        <div class="form-group">
        <label for="description-text" class="col-form-label">Lesson Description:</label>
        <textarea class="form-control" id="description-text" v-model="localLesson.description" required></textarea>
        </div>

        <div class="form-group">
        <label for="objectives-text" class="col-form-label">Lesson Objectives:</label>
        <textarea class="form-control" id="objectives-text" v-model="localLesson.objectives" required></textarea>
        </div>

        <div class="form-group">
        <label for="estimated-effort" class="col-form-label">Estimated Effort (hours):</label>
        <input
          type="number"
          class="form-control"
          id="estimated-effort"
          v-model="localLesson.estimatedEffort"
          min="0"
          step="0.5"
          required
        />
        </div>
        
        <!-- Supervisor Email -->
        <div class="form-group mb-3">
        <label for="creator">Supervisor (Owner):</label>
        <select id="creator" class="form-select" v-model="localLesson.creator" required>
          <option value="" disabled>Select a supervisor</option>
          <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
            {{ s.firstName }} {{ s.lastName }} ({{ s.email }})
          </option>
        </select>
        <div v-if="!allSupervisors.length" class="small text-muted">No supervisors available</div>
      </div>

        <!-- <div class="form-group">
            <label for="creator" class="col-form-label">Instructor Name:</label>
            <input type="text" class="form-control" id="creator" v-model="localLesson.creator" required>
        </div> -->

        <div class="form-group">
            <label for="credit" class="col-form-label">Credit Points:</label>
            <input type="number" class="form-control" id="credit" v-model="localLesson.credit" min="0" required>
        </div>

        <div class="form-group">
            <label for="status" class="col-form-label">Status:</label>
            <select id="status" name="status" class="form-select" v-model="localLesson.status" required>
            <option value="" disabled selected>Select Status</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
            <option value="draft">Draft</option>
            </select>
        </div>
        
        <div class="form-group mb-3" data-bs-display="static">
          <label class="col-form-label">Prerequisite Lessons:</label>
          <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
            <ul class="list-unstyled mb-0">
              <li v-for="lesson in allLessons" :key="lesson._id" class="mb-2">
                <div class="form-check">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :value="lesson._id" 
                    v-model="localLesson.prerequisites" 
                    :id="`lesson-${lesson._id}`">
                  <label class="form-check-label" :for="`lesson-${lesson._id}`">
                    {{ lesson.name }}
                  </label>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
        <label for="reading-text" class="col-form-label">Reading List:</label>
        <textarea class="form-control" id="reading-text" v-model="localLesson.reading"></textarea>
        </div>
        <div class="form-group">
        <label for="assignment-text" class="col-form-label">Assignment:</label>
        <textarea class="form-control" id="assignment-text" v-model="localLesson.assignment"></textarea>
        </div>

        <!-- Buttons to cancel or save the change-->
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="submit" class="btn btn-primary">Create Lesson</button>
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
import { getSupervisors } from '../api';

export default {
  name: "lessonModal",
  emits:['add-lesson'],
  props: {
    allLessons: {
      type: Array,
      default: () => []
    },
    userEmail: {
      type: String,
      default: () => 'placeholderEmail@gmail.com'
    },
    // allSupervisors: {
    //   type: Array,
    //   default: () => [{email: 'placeholderEmail@gmail.com'}, {email: "supervisorsAreNotLoading@gmail.com"}, {email: "2@gmail.com"}]
    // },
  },
  async mounted() {
    const res1 = JSON.parse(localStorage.getItem("user"));
    if (res1) this.localLesson.creator = res1.email;
    // prefill with current user's email

    const res = await getSupervisors();
    this.allSupervisors = res.data

  },
  components: { Icon },
  data() {
    return {
      localLesson: {
        name: '',
        credit: '',
        creator: '',
        id: '',
        description: '',
        objectives: '',
        estimatedEffort:'',
        status: '',
        prerequisites: [],
        reading: '',
        assignment: ''
      },
      allSupervisors: ''
    };
  },
  methods: {
    submitLesson() {
      this.$emit('add-lesson', { ...this.localLesson }); // send to parent which is lessons.vue
      const modalEl = document.getElementById('add-lesson');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl); // Get the existing modal instance
      modal.hide();

      // reset form
      this.localLesson = {
        name: '',
        credit: '',
        creator: '',
        id: '',
        description: '',
        objectives:'',
        estimatedEffort:'',
        status: '',
        prerequisites: [],
        reading: '',
        assignment: ''
      };
    }
  },
  watch: {
    'localLesson.prerequisites'(val) {
      console.log('Selected prerequisites:', val);
    }
  }
};
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