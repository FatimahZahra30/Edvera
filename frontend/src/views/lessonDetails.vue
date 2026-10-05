<template>
    <div class="layout">
        <!-- Fixed sidebar -->
        <aside class="sidebar">
            <TeacherSidebar page-title="Lessons"/>
        </aside>

        <main class="content">
            <div class="content-pad">
                <!-- Lesson Header -->
                <div class="d-flex flex-column flex-md-row align-items-start justify-content-between mb-3">
                    <div>
                        <h1 class="h4 mb-1">{{ lesson.name }}</h1>
                        <div class="text-muted">Lesson ID: {{ lesson.id }}</div>
                    </div>
                </div>

                    <!-- General Information -->
                    <section class="mb-4 text-start">
                        <h2 class="h5 mb-3">General Information</h2>

                        <div class="d-flex align-items-center">
                            <h3 class="h6 mb-1 me-2 bold">Owner:</h3>
                            <p class="mb-1 text-muted">{{ lesson.creatorFirstName }} {{ lesson.lastName }} ({{ lesson.creator }})</p>
                        </div>
                        
                        <div class="mb-3" style="margin-top:10px">
                            <h3 class="h6 mb-1 bold">Description</h3>
                            <p class="mb-0">{{ lesson.description }}</p>
                        </div>

                        <!-- Objectives -->
                        <div class="h6 mb-1 bold">Objectives:</div> 
                        <ul class="list-unstyled ms-3">
                            <li v-for="(item, idx) in lesson.objectives.split('\n')" :key="idx">
                            • {{ item }}
                            </li>
                        </ul>
                        <!-- <div class="mb-1"><span class="text-muted">Objectives:</span> <span>{{ lesson.objectives }}</span></div> -->
                        <div class="h6 mb-1 bold"><span>Estimated Effort:</span> <span class="mb-1 text-muted">{{ lesson.estimatedEffort }} hrs</span></div>
                        <div class="h6 mb-1 bold" v-if="userRole !== 'student'"><span class="mb-1 text-muted">Status:</span> <span class="text-capitalize">{{ lesson.status }}</span></div>
                        <div class="h6 mb-1 bold"><span>Credit Points:</span> <span class="mb-1 text-muted">{{ lesson.credit }}</span></div>
                        
                        <!-- Collapsable for lesson prerequisite details -->
                        <div class="mb-3">
                            <div class="d-flex align-items-center justify-content-between mb-2">
                                <h2 class="h5 mt-4 mb-3">Prerequisites</h2>
                                <button
                                class="btn btn-sm btn-outline-secondary"
                                type="button"
                                @click="lessonsExpanded = !lessonsExpanded"
                                >
                                {{ lessonsExpanded ? 'Collapse' : 'Expand' }}
                                </button>
                            </div>

                            <div v-show="lessonsExpanded">
                                <ul v-if="lesson.prerequisites.length" class="list-group">
                                    <li
                                    v-for="id in lesson.prerequisites"
                                    :key="id"
                                    class="list-group-item d-flex justify-content-between align-items-start"
                                    >
                                    <div class="me-auto">
                                        <div class="fw-semibold">{{ id.name || id.title || 'Untitled Lesson' }}</div>
                                        <small class="text-muted">ID: {{ id.id || id.code || '—' }}</small>
                                    </div>
                                    </li>
                                </ul>

                                <div v-else class="border rounded-3 p-4 text-center text-muted">
                                    No prerequisites for this lesson.
                                </div>
                                </div>
                            </div>

                        <!-- Reading list and assignment details -->
                        <h2 class="h5 mt-4 mb-3">Reading List</h2>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(item, idx) in lesson.reading.split('\n')" :key="idx">
                            • {{ item }}
                            </li>
                        </ul>

                        <h2 class="h5 mt-4 mb-3">Assignments</h2>
                        <ul class="list-unstyled ms-3">
                            <li v-for="(item, idx) in lesson.assignment.split('\n')" :key="idx">
                            • {{ item }}
                            </li>
                        </ul>

                        <!-- Student grade and feedback display-->
                        <div class="d-flex flex-row align-items-center mb-3">
                            <h2 class="h5 mb-0 me-2" v-if="userRole == 'student'">Grade:</h2>
                            <span v-if="userRole == 'student'">{{ lesson.grade || 'Not Available' }}</span>
                        </div>

                        <h2 class="h5 mt-4 mb-3" v-if="userRole == 'student'">Feedback</h2>
                        <div class="mb-1" v-if="userRole == 'student'"> <span>{{ lesson.feedback || 'Not Available' }}</span></div>
                    </section>
            </div>
        </main>
    </div>
</template>

<script>
import TeacherSidebar from '../components/teacher-sidebar.vue'
import { getLessons, getSupervisors, getLessonsForStudent, getAllGrades } from "../api";

export default {
  name: "LessonDetails",
  components: {TeacherSidebar},
  data() {
    return { 
      lessonsExpanded: true,
      userRole: 'instructor',
      lesson: {
      id: '',
        name: '',
        description: '',
        objectives:'',
        estimatedEffort:'0',
        credit: '',
        creator: '',
        status: '',
        prerequisites: [],
        reading: '',
        assignment: '',
        grade: '',
        feedback: '',
        creatorFirstName: '',
        creatorLastName: ''
    }
     };
  },
  async mounted() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) this.userRole = user.role;

  let res = []

  const id = this.$route.params.id;
  if (this.userRole != "student") {
    res = await getLessons(); // fetch all lessons
  } else{
    res = await getLessonsForStudent(user.email)
  }
  
  const lessonData = res.data.find(l => l.id === id);
  console.log("Jeevana")
  console.log(lessonData)


  // If lessonData exists
  if (lessonData) {
    // Map prerequisite IDs to full lesson objects
    this.lesson.prerequisites = lessonData.prerequisites
        .map(preId => res.data.find(l => l.id === preId))

    // getting the first and last name of supervisors also 
    const result = await getSupervisors()
    const supervisorList = result.data
    const supervisorData = supervisorList.filter(s => s.email === lessonData.creator)


    this.lesson = {...lessonData, 
        creatorFirstName: supervisorData[0].firstName,
        creatorLastName: supervisorData[0].lastName
    };
    console.log("Lesson:", this.lesson)
  }

},
};
</script>

<style>
/* ---------- Set overall layout ---------- */
.layout {
  --sidebar-w: 250px;
  --header-h: 90px;
  --content-pad-x: 1.25rem;
  --content-pad-y: 1rem;
  --bg: #e3ebff;
  --border: #8895a2;
}
.layout { background: var(--bg); min-height: 100vh; }

.main-content-wrapper {
  margin-left: 220px; 
  margin-top: 11rem; 
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  gap: 2rem; 
  min-height: calc(100vh - 11rem); 
}

/* ---------- Fixed Header ---------- */
.header-bar {
  position: fixed; top: 0; left: var(--sidebar-w); right: 0;
  height: var(--header-h);
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 var(--content-pad-x) 0 calc(var(--content-pad-x) + .25rem);
  background: var(--bg); border-bottom: 1px solid var(--border);
  z-index: 10;
}
.header-left { display: flex; flex-direction: column; }

/* ----------- Fixed collapsable layout --------- */
.kv-grid li { display: grid; grid-template-columns: 80px 1fr; gap: .25rem .75rem; align-items: start; }
.kv-grid .label { text-align: left; color: #6c757d; }
.kv-grid .value { text-align: right; font-weight: 600; word-break: break-word; }

.mb3 {
    margin: 0; 
    padding-top:0;
}
</style>