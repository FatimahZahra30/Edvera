<template>
  <div class="layout">
    <!-- Fixed Sidebar -->
    <aside class="sidebar">
      <TeacherSidebar page-title="Classroom Details"/>
    </aside>

    <main class="content">
      <div class="content-pad">
        <!-- Classroom Header -->
        <div class="left-align d-flex flex-column flex-md-row align-items-start justify-content-between mb-3">
          <div>
            <h1 class="h4 mb-1">{{ classroom.name }}</h1>
            <div class="text-muted">Classroom ID: {{ classroom.classroomID }}</div>
          </div>

          <!-- Added Grading Button -->
          <div v-if="userRole !== 'student'">
            <button 
              class="btn btn-primary mt-2 mt-md-0"
              @click="$router.push(`/classrooms/${classroom.classroomID}/grading`)"
            >
              Open Grading
            </button>
          </div>
          <!-- End Grading Button -->
        </div>

        <!-- General Information -->
        <section class="mb-4 text-start">
          <h2 class="h5 mb-3">General Information</h2>
          
          <div class="mb-3">
            <h3 class="h6 bold mb-1">Description</h3>
            <p class="mb-0">{{ classroom.description }}</p>
          </div>
          <div class="mb-1"><span class="h6 bold">Start Date:</span> <span>{{ formatDate(classroom.startDate) }}</span></div>
          <div class="mb-1"><span class="h6 bold">End Date:</span> <span>{{ formatDate(classroom.endDate) }}</span></div>
          <div class="mb-1"><span class="h6 bold">Duration:</span> <span>{{ classroom.duration }} day(s)</span></div>
          <div class="mb-1" v-if="userRole !== 'student'"><span class="h6 bold">Status:</span> <span class="text-capitalize">{{ classroom.status }}</span></div>
          <div class="mb-1"><span class="h6 bold">Owner:</span> <span>{{ classroom.supervisor }}</span></div>
          <div class="mb-1"><span class="h6 bold">Associated Course:</span> <span>{{ classroom.associatedCourseName }} (ID: {{ classroom.associatedCourseID }})</span></div>
        </section>

        <!-- Lessons -->
        <section>
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h3 class="h5 mb-0">Lessons</h3>
            <div class="text-muted small">{{ classroom.selectedLessons?.length }} total</div>
          </div>

          <div class="row g-3 row-cols-1 row-cols-sm-2 row-cols-lg-3">
            <div v-for="l in classroom.selectedLessons" :key="l.id" class="col">
              <div v-if="l.name !== 'Unknown Lesson'" class="card h-100 shadow-sm">
                <div class="ratio ratio-21x9" style="background:linear-gradient(135deg,#e2e8f0,#c7d2fe)"></div>
                <div class="card-body d-grid gap-2">
                  <h4 class="h6 card-title mb-0" @dblclick="goToLesson(l)" style="cursor: pointer">{{ l.name }}</h4>

                  <ul class="list-unstyled small mb-0 kv-grid">
                    <li><span class="label">ID</span><span class="value">{{ l.id }}</span></li>
                    <li><span class="label">Owner</span><span class="value">{{ l.creator }}</span></li>
                    <li><span class="label">Credit Points</span><span class="value">{{ l.credit }} </span></li>
                    <span class="badge text-bg-success" v-if="l.status === 'published' && userRole !== 'student'">Published</span>
                    <span class="badge text-bg-warning text-dark" v-else-if="l.status === 'draft' && userRole !== 'student'">Draft</span>
                    <span class="badge text-bg-secondary" v-else-if="l.status === 'archived' && userRole !== 'student'">Archived</span>
                    <span class="credit-points" v-else v-if="userRole !== 'student'">Status not available</span>
                  </ul>
                  <!-- <div class="lesson-progress" v-if="userRole == 'student'">
                      <span class="badge text-bg-success" v-if="l.grade === 'completed' && userRole == 'student'">Completed</span>
                      <span class="badge text-bg-warning text-dark" v-else-if="l.grade === 'fail' && userRole == 'student'">Fail</span>
                      <span class="badge text-bg-secondary" v-else-if="l.grade === 'pass' && userRole == 'student'">Pass</span>
                      <span class="locked" v-if="l.prerequisites && l.prerequisites.length">
                        <Icon class="lock-icon" icon="ic:twotone-lock" width="30" height="30" />
                      </span>
                  </div> -->
                </div>
              </div>
            </div>

            <div v-if="!classroom.selectedLessons?.length" class="col-12">
              <div class="border rounded-3 p-4 text-center text-muted">
                No lessons for this classroom.
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
  
  <classroomEditModal
    :classroom="classroom"
    @classroom-updated="handleClassroomUpdated"
  />
  <classroomDeleteModal
    :classroom-to-delete="classroom"
    @delete-classroom="handleDelete"
  />
</template>


<script>
import TeacherSidebar from '../components/teacher-sidebar.vue'
import ClassroomEditModal from '../components/classroom-edit-modal.vue'
import ClassroomDeleteModal from '../components/classroom-delete-modal.vue'
import ClassroomEnrol from '../components/classroom-enrol.vue'
import { getClassrooms, getLessons, getAllCourses, getSupervisors } from '../api'

export default {
  name: 'ClassroomDetailsPage',
  props: { classroomID: { type: String, required: true } },
  components: { TeacherSidebar, ClassroomEditModal, ClassroomDeleteModal, ClassroomEnrol },
  data() {
    return {
      userRole: 'student',          // demo: student sees Enrol
      currentUser: 'Ada Lovelace',  // pass to enrol modal if needed
      selected: null,               // declare this since openEnrol sets it
      classroom: {
        classroomID: '',
        name: '',
        description: '', 
        status: '',
        startDate: '',
        endDate: '',
        supervisor: '',
        supervisorFirstName: '',
        supervisorLastName: '',
        credits: 0,
        selectedLessons: [],
        duration: '', // NEWLY ADDED!
        associatedCourseID: '',
        associatedCourseName: ''
        // students - MUST SEE IF CAN IMPLEMENT
      },
      studentLessons: []  // seperate lessons for students
    }
  },
  async mounted() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    this.userRole = user.role;
    this.currentUser = user;
  }

  try {
    const id = this.$route.params.id;
    const res = await getClassrooms();
    const found = res.data.find(c => c.classroomID === id);

    // WHEN USES CLASSROOM ID, NOT MONGO DB ID
    // found.selectedLessons = found.selectedLessons.map(lessonID=> {
    //   return res.data.find(l => l.id === lessonID) || { id: lessonID, name: "Unknown Lesson" };
    // });

    // 2️⃣ Get all lessons (or you can fetch only the ones in selectedLessons if backend supports it)
    const lessonsRes = await getLessons(); // fetch all lessons
    console.log("Obtained lessons:", lessonsRes);
    const allLessons = lessonsRes.data;

    // 3️⃣ Map ObjectId references to lesson objects
    found.selectedLessons = found.selectedLessons?.map(lessonID => { //the OBJECT ID
    // lessonID might be a string or ObjectId; compare as string
    return allLessons.find(l => l._id.toString() === lessonID.toString()) || { id: lessonID, name: "Unknown Lesson" };

    });

    const coursesRes = await getAllCourses()
    const allCourses = coursesRes.data

    // 3️⃣ Map ObjectId references to lesson objects
    found.associatedCourse = found.associatedCourse?.map(courseID => { //the OBJECT ID
    // lessonID might be a string or ObjectId; compare as string
    return allCourses.find(l => l._id.toString() === courseID.toString()) || { id: courseID, name: "Unknown Course" };
    });

    found.associatedCourse = found.associatedCourse?.[0] //take it out of the array
    console.log(found.associatedCourse)

    // getting the first and last name of supervisors also 
      const result = await getSupervisors()
      const supervisorList = result.data
      const supervisorData = supervisorList.filter(s => s.email === found.supervisor)


    if (found) {
      this.classroom = {
        classroomID: found.classroomID,
        name: found.name,
        supervisor: found.supervisor, //its in the form of email
        description: found.description,
        status: found.status,
        startDate: found.startDate,
        endDate: found.endDate,
        selectedLessons: found.selectedLessons || [],
        duration: found.duration,
        associatedCourseID: found.associatedCourse?.id,
        associatedCourseName: found.associatedCourse?.title,
        supervisorFirstName: supervisorData?.[0].firstName || "No",
        supervisorLastName: supervisorData?.[0].lastName || "actual supervisor!"
      };
    
      console.log(this.classroom.supervisorFirstName)
      console.log(this.classroom.supervisorLastName)
      // For student role, filter only published lessons
      if (this.userRole === "student") {
        this.classroom.selectedLessons = this.classroom.selectedLessons.filter(l => l.status === "published");
      }
    }

    console.log(this.classroom.selectedLessons)
  } catch (err) {
    console.error("Failed to load classrooms:", err);
  }
},
  // ------------ Obtain all lessons in the course ----------
  computed: {
    lessons() {
      if (this.userRole === "student") {
        return this.studentLessons;  //  override when student
      } // fallback to []
      return this.course?.lessons || [];
    }
  },
  methods: {
    goToLesson(lesson) {
      if (this.userRole === 'student' && lesson.prerequisites && lesson.prerequisites.length > 0) {
        console.log("Lesson prerequisites:", lesson.prerequisites)

        const prereqList = lesson.prerequisites?.map(l => `${l.name} (ID: ${l.id})`) // ✅ no braces → implicit return
          .join('\n• ')

        alert(`Please complete the following prerequisites before accessing this lesson:\n• ${prereqList}`)
        return // stop navigation
      }


      // No prerequisites, allow navigation
      this.$router.push(`/lessons/${lesson.id}`);
    },
    // ---------- Open existing modal components ----------
    openEditModal() {
      // If your CourseEdit uses a different id, change "edit-course" here
      const el = document.getElementById('classroom-updated')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },
    openDeleteModal() {
      const el = document.getElementById('delete-classroom')
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },

    // ---------- Handlers for modal emits ----------
    async handleClassroomUpdated(updated) {
      try {
        console.log (" Sending update to backend:" , updated);
        const res = await updateClassroom(updated.classroomID, updated);
        const saved = res.data.updatedClassroom ?? res.data;

        const i = this.classrooms.findIndex(r => r.classroomID === saved.classroomID);
        if (i !== -1) {
          this.classrooms.splice(i, 1, saved);
        }
      } catch (err) {
        console.error("Failed to update classroom:", err.response?.data || err.message);
        alert("Failed to save changes. Please try again.");
      }
    },
    async handleDelete(room) {
      try {
        await deleteClassroom(room.classroomID)
        this.classrooms = this.classrooms.filter(r => r.classroomID !== room.classroomID)

        const modalEl = document.getElementById('delete-classroom')
        if (modalEl){
          const modal = Modal.getInstance(modalEl) || Modal.getOrCreateInstance(modalEl)
          modal.hide()
        }
        window.location.reload()
      } catch (err) {
        console.error('Failed to delete classroom:', err?.response?.data || err?.message)
      }
    },
    async fetchClassroom() {
    try {
      const { data: classrooms } = await getClassrooms();
      const found = classrooms.find(c => c.classroomID === this.classroomID);
      if (found) {
        this.classroom = found;
      }
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  },

    // ---------- Display helpers ----------
    displayOwner(x) {
      return x.owner || x.supervisor || x.instructor || '—'
    },
    openDeleteModal() {
      const el = document.getElementById('delete-course') // match id inside course-delete.vue
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },
    openEnrol() {
      // If your enrol modal targets the overall course:
      this.selected = this.course
      const el = document.getElementById('enrol-course') // match id inside course-enrol.vue
      el && window.bootstrap?.Modal.getOrCreateInstance(el).show()
    },

    handleCourseSaved(updated) {
      const next = updated?.course || updated
      if (!next) return
      this.course = { ...this.course, ...next }
    },
    handleCourseDeleteConfirmed(payload) {
      const id = payload?.id ?? this.course?.id ?? this.id
      console.info('Delete confirmed for course id:', id)
      // e.g., this.$router.push({ name: 'Courses' })
    },
    handleEnrolConfirmed(payload) {
      console.info('Enrol confirmed:', payload || this.selected)
      // reflect enrolment locally if needed
    },

    displayOwner(x) { return x.owner || x.supervisor || x.instructor || '—' },
    displayId(x) { return x.code || x.id || '—' },
    formatDate(iso) {
      if (!iso) return '—'
      try {
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso))
      } catch { return iso }
    },
  },
}
</script>

<style scoped>
/* .layout { --sidebar-w: 250px; --header-h: 60px; --content-pad-x: 1.25rem; --content-pad-y: 1rem; --bg: #e3ebff; --border: #8895a2; }
.layout { background: var(--bg); min-height: 100vh; } */
.sidebar { position: fixed; top: 0; left: 0; width: var(--sidebar-w); height: 100vh; box-sizing: border-box; }
.content { position: fixed; top: var(--header-h); left: var(--sidebar-w); right: 0; bottom: 0; overflow: auto; }
.content-pad { padding: var(--content-pad-y) calc(var(--content-pad-x) + 2rem); }
.ratio-21x9 { --bs-aspect-ratio: 42.857%; }
.kv-grid li { display: grid; grid-template-columns: 80px 1fr; gap: .25rem .75rem; align-items: start; }
.kv-grid .label { text-align: left; color: #6c757d; }
.kv-grid .value { text-align: right; font-weight: 600; word-break: break-word; }
.left-align { text-align: left; }
</style>
