<template>
  <teleport to="body">
    <!-- Bootstrap modal for creating a course -->
    <div class="modal fade" id="add-course" tabindex="-1" role="dialog" aria-labelledby="addCourseLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">

          <!-- Header -->
          <div class="modal-header">
            <h5 class="modal-title" id="addCourseLabel">New Course</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <!-- Form -->
          <form @submit.prevent="submitCourse">
            <div class="modal-body">

              <!-- Core Information -->
              <div class="form-group mb-3">
                <label for="course-id" class="col-form-label">Course ID:</label>
                <input type="text" class="form-control" id="course-id" v-model="localCourse.id" required>
              </div>

              <div class="form-group mb-3">
                <label for="course-title" class="col-form-label">Title:</label>
                <input type="text" class="form-control" id="course-title" v-model="localCourse.title" required>
              </div>

              <div class="form-group mb-3">
                <label for="course-description" class="col-form-label">Description:</label>
                <textarea class="form-control" id="course-description" v-model="localCourse.description" required></textarea>
              </div>

              <!-- Dates
              <div class="form-group mb-3">
                <label for="date-created" class="col-form-label">Date Created:</label>
                <input type="date" class="form-control" id="date-created" v-model="localCourse.createdAt" required>
              </div> -->

              <!-- Selecting Lessons -->
              <div class="form-group mb-3">
                <label class="col-form-label">Lessons (select any):</label>
                <div class="border rounded p-2" style="max-height: 150px; overflow-y: auto;">
                  <ul class="list-unstyled mb-0">
                    <li v-for="lesson in allLessons" :key="lesson._id" class="mb-2">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          :value="lesson._id" 
                          v-model="localCourse.lessons" 
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
                <select id="status" name="status" class="form-select" v-model="localCourse.status" required>
                  <option value="" disabled>Select Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <!-- Supervisor Email -->
              <div class="form-group mb-3">
                <label for="col-form-label">Supervisor (Owner):</label>
                <select id="creator" class="form-select" v-model="localCourse.supervisor" required>
                  <option value="" disabled>Select a supervisor</option>
                  <option v-for="s in allSupervisors" :key="s._id" :value="s.email">
                    {{ s.firstName }} {{ s.lastName }} ({{ s.email }})
                  </option>
                </select>
              </div>
              <!-- <div class="form-group mb-3">
                <label for="supervisor" class="col-form-label">Supervisor (Owner):</label>
                <input type="text" class="form-control" id="supervisor" v-model="localCourse.supervisor" required>
              </div> -->

            </div>

            <!-- Footer -->
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="submit" class="btn btn-primary">Create Course</button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </teleport>
</template>

<script>

import { getSupervisors } from '../api';

export default {
  name: "courseModal",
  emits:['add-course'],
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
    // }
  },
  data() {
    return {
      userEmail: '',
      localCourse: {
        id: '',
        title: '',
        description: '',
        // createdAt: '',
        // updatedAt: '', // handled in the backend
        lessons: [],
        status: '',
        allSupervisors: [],
        supervisor: '', //BACKEND STORES EMAIL
        supervisorFirstName: '',
        supervisorLastName: ''
      
      }
    };
  },
  async mounted() {
    // STORE THE CURRENT USER'S EMAIL (as the default supervisor)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) this.localCourse.supervisor = user.email;


    const res = await getSupervisors();
    this.allSupervisors = res.data

  },
  methods: {
    submitCourse() {
      this.$emit('add-course', { ...this.localCourse }); // send to parent
      const modalEl = document.getElementById('add-course');
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.hide();

      // reset form
      this.localCourse = {
        id: '',
        title: '',
        description: '',
        // createdAt: '',
        // updatedAt: '', handled at the backend
        lessons: [],
        status: '',
        supervisor: ''
      };
    }
  }
};
</script>

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