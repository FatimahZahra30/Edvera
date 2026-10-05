<template>
  <div class="layout">
    <!-- Fixed Sidebar -->
    <aside class="sidebar">
      <TeacherSidebar page-title="Lessons"/>
    </aside>

    <!-- Scrollable Content -->
    <main class="content">
      <div class="content-pad">
        <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-3">
          <div v-if="isLoading" class="border rounded-3 p-4 text-center text-muted w-100">Please wait for your lessons to load.</div>
          <!-- Toolbar -->
           <form class="row g-2" @submit.prevent>
            <!-- New Course -->
            <div class="col-12 col-md-auto">
              <button
                v-if="userRole !== 'student'"
                type="button"
                class="btn btn-primary w-100"
                data-bs-toggle="modal"
                data-bs-target="#add-lesson"
              >
                + New Lesson
              </button>
            </div>
            <!-- Filtering for instructors -->
            <div v-if="userRole !== 'student'" class="col-6 col-md-auto">
              <select v-model="supervisorFilter" class="form-select" aria-label="Filter by supervisor">
                <option value="">All lessons</option>
                <option value="mine">My lessons</option>
                <option value="others">Other lessons</option>
              </select>
            </div>
           </form>
          </div>

          <!-- Lesson modals -->
           <lessonModal @add-lesson="addLesson" :all-lessons="lessons" />
           <lessonEditModal :lesson="selectedLesson" :all-lessons="lessons" @lesson-updated="handleLessonUpdated" />
           <lessonDeleteModal :lesson-to-delete="selectedLesson" @delete-lesson="handleDelete" />
           
          <!-- Grid -->
           <div class="row g-3 row-cols-1 row-cols-sm-1 row-cols-lg-3">
            <div v-for="lesson in visibleLessons" :key="lesson.id" class="col">
              <div class="card h-100 shadow-sm">
                <div class="ratio ratio-21x9" style="background:conic-gradient(from 240deg at 60% 40%, #7c8cff55, #22d3ee55, #7c8cff55)"></div>
                <div class="card-body d-grid gap-2">
                  <!-- Title + status pill -->
                  <div class="d-flex justify-content-between align-items-start">
                    <h2
                      class="h5 card-title mb-0"
                      @dblclick="goToLesson(lesson)"
                      style="cursor: pointer"
                    >{{ lesson.name }}</h2>
                    <span class="badge text-bg-success" v-if="lesson.status === 'published' && userRole !== 'student'">Published</span>
                    <span class="badge text-bg-warning text-dark" v-if="lesson.status === 'draft' && userRole !== 'student'">Draft</span>
                    <span class="badge text-bg-secondary" v-if="lesson.status === 'archived' && userRole !== 'student'">Archived</span>
                  </div>

                  <!-- Overview -->
                  <ul class="list-unstyled small mb-0 kv-grid">
                    <li><span class="label"><strong>ID</strong></span><span class="value text-muted">{{ lesson.id }}</span></li>
                    <li><span class="label"><strong>Credit Points</strong></span><span class="value text-muted">{{ lesson.credit }}</span></li>
                  </ul>

                  <div class="lesson-progress" v-if="userRole == 'student'">
                      <!-- Only show lock if there are prerequisites, MUST COMPARE WITH GRADE LATER -->
                      <span class="locked" v-if="lesson.isLocked">
                        <Icon class="lock-icon" icon="ic:twotone-lock" width="30" height="30" />
                      </span>
                  </div>
                </div>
                
                <div class="card-footer  d-flex gap-2">
                  <button v-if="userRole !== 'student'" type="button" class="btn btn-outline-secondary btn-sm" @click="openEditModal(lesson)">Edit</button>
                  <button v-if="userRole !== 'student'" type="button" class="btn btn-outline-danger btn-sm" @click="openDeleteModal(lesson)">Delete</button>
                  <span class="badge text-bg-success" v-if="lesson.grade === 'Pass' && userRole === 'student'">Passed</span>
                  <span class="badge text-bg-warning text-dark" v-else-if="lesson.grade === 'Fail' && userRole === 'student'">Failed</span>
                  <span class="badge text-bg-secondary" v-else-if="lesson.grade === 'Ungraded' && userRole === 'student'">Ungraded</span>
                </div>
              </div>
           </div>

          <!-- If no lessons -->
          <!-- <div v-if="!visibleCourses.length" class="col-12">
            <div class="border rounded-3 p-4 text-center text-muted">
              No courses match your filters.
            </div>
          </div> -->
          
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import {Icon} from '@iconify/vue'
import TeacherSidebar from '../components/teacher-sidebar.vue'
import lessonModal from '../components/lesson-modal.vue'
import lessonEditModal from '../components/lesson-edit-modal.vue'
import lessonDeleteModal from '../components/lesson-delete-modal.vue'
import { getLessons, createLesson, deleteLesson, getLessonsForStudent, getAllGrades } from "../api";

export default {
  name: "Lesson",
  components: { Icon, lessonModal, TeacherSidebar, lessonEditModal, lessonDeleteModal },
  data() {
    return {
      isLoading: false,
      userRole: "student",
      lessons: [],
      selectedLesson: null,
      supervisorFilter: '',
      gradedLessons: [],
      currentUser: null,
      studentLessons: [] // stores all students lessons with grades
    };
  },
  computed: {
    visibleLessons() {
      let list = this.lessons || [];

      // Lightweight supervisor filtering only
      if (this.supervisorFilter === 'mine') {
        list = list.filter(c => c.creator === this.currentUser);
      } else if (this.supervisorFilter === 'others') {
        list = list.filter(c => c.creator !== this.currentUser);
      }

      return list;
    }
  },

  async mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    this.userRole = user.role;
    this.currentUser = user.email;
    this.user_id = user._id;

    try {
      if (this.userRole === "student") {
        this.isLoading = true
        // 🧩 1️⃣ Fetch lessons + grades in parallel
        const [lessonRes, gradeRes] = await Promise.all([
          getLessonsForStudent(user.email),
          getAllGrades()
        ]);

        this.studentLessons = lessonRes

        // 🧩 2️⃣ Filter lessons to only published
        let lessons = lessonRes.data.filter(l => l.status === "published");
        // Remove duplicates
        const uniqueLessons = new Map();
        lessons.forEach(lesson => {
          const lessonId = lesson._id?.toString() || lesson.id?.toString();
          if (!uniqueLessons.has(lessonId)) {
            uniqueLessons.set(lessonId, lesson);
          }
        });
        lessons = Array.from(uniqueLessons.values());
        // 🧩 3️⃣ Add lock info concurrently
        await Promise.all(
          lessons.map(async lesson => {
            lesson.isLocked = await this.isLocked(lesson.prerequisites);
          })
        );

        // 🧩 4️⃣ Filter grades relevant to this student and these lessons
        const lessonIds = new Set(lessons.map(l => l._id?.toString()));
        const gradedLessons = gradeRes.data.filter(
          g => g.student === user._id && lessonIds.has(g.lesson)
        );

        // 🧩 5️⃣ Build lookup + sort lessons by grade
        const gradeOrder = { Fail: 0, Pass: 1, "": 2 };
        const gradedMap = Object.fromEntries(
          gradedLessons.map(g => [g.lesson?.toString(), g.grade || ""])
        );

        lessons.sort((a, b) => {
          const rankA = gradeOrder[gradedMap[a._id?.toString() || a.id] ?? ""] ?? 2;
          const rankB = gradeOrder[gradedMap[b._id?.toString() || b.id] ?? ""] ?? 2;
          return rankA - rankB;
        });

        // 🧩 6️⃣ Assign once (triggers reactivity)
        this.lessons = lessons;
        this.gradedLessons = gradedLessons;

        console.log("Final lessons:", this.lessons);
        console.log("Graded lessons:", this.gradedLessons);
      } else {
        // Teachers/admins
        const res = await getLessons();
        this.lessons = res.data;
      }


    } catch (err) {
      console.error("Failed to fetch lessons:", err.response?.data || err.message);
    }
    this.isLoading = false
  },
  methods: {
    async isLocked(prerequisites) {
    try {
      // Fetch student lessons that include grade + feedback

      // If no prerequisites, lesson is not locked
      if (!prerequisites || prerequisites.length === 0) {
        return false;
      }

      //const { data: studentLessons } = await getLessonsForStudent(this.currentUser);

      // Build a quick lookup (lessonId -> grade)
      const gradeMap = new Map(
        this.studentLessons.map(l => [l._id?.toString(), l.grade?.toLowerCase()])
      );

      // Check if every prerequisite has grade "pass"
      const allPassed = prerequisites.every(prereq => {
        const grade = gradeMap.get(prereq._id?.toString());
        return grade === "pass";
      });


      // If not all passed, the lesson is locked
      return !allPassed;
    } catch (error) {
      console.error("Error checking locked state:", error);
      return true; // default to locked on error
    }
  },
    getGradeForLesson(lesson) {
      // if (!this.gradedLessons || !this.gradedLessons.length) {
      //   console.log("Can't find gradedLessons for lesson:", lesson.name);
      //   return null;
      // }
      const match = this.gradedLessons.find(s => s.lesson === lesson._id);
      console.log(`Grade for ${lesson.name}:`, match?.grade || 'Not found');
      return match?.grade || null;
    },

    goToLesson(lesson) {
      if (this.userRole === 'student' && lesson.isLocked) {
        console.log("Lesson prerequisites:", lesson.prerequisites)

        const prereqList = lesson.prerequisites
          .map(l => `${l.name} (ID: ${l.id})`)
          .join('\n• ')

        alert(`Please complete the following prerequisites before accessing this lesson:\n• ${prereqList}`)
        return
      }
      this.$router.push(`/lessons/${lesson.id}`);
    },

    openEditModal(lesson) {
      this.selectedLesson = { ...lesson };
      this.$nextTick(() => {
        const modalEl = document.getElementById("edit-lesson");
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      });
    },

    handleLessonUpdated(updated) {
      const updatedLesson = updated?.updatedLesson ?? updated;
      const i = this.lessons.findIndex((l) => l.id === updatedLesson.id);
      if (i !== -1) this.lessons[i] = updatedLesson;
    },

    async addLesson(lesson) {
      try {
        const res = await createLesson(lesson);
        this.lessons.push(res.data);
        window.location.reload();
      } catch (err) {
        console.error("Failed to save lesson:", err.response?.data || err.message);
        alert('This lesson ID already exists!');
        window.location.reload();
      }
    },

    openDeleteModal(lesson) {
      this.selectedLesson = lesson;
      const modalEl = document.getElementById("delete-lesson");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    },

    async handleDelete(lesson) {
      const dependentLessons = this.lessons.filter(l => 
        l.prerequisites && l.prerequisites.includes(lesson.id)
      );

      if (dependentLessons.length > 0) {
        const dependentList = dependentLessons
          .map(l => `${l.name} (ID: ${l.id})`)
          .join('\n• ');
        alert(`This lesson cannot be deleted! It is a prerequisite for the following units:\n• ${dependentList}`);
        return;
      }

      try {
        await deleteLesson(lesson.id);
        this.lessons = this.lessons.filter((l) => l.id !== lesson.id);
        window.location.reload();
      } catch (err) {
        console.error("Failed to delete lesson:", err.response?.data || err.message);
      }
    },
  },
};
</script>
