<template>
  <div class="layout">
    <aside class="sidebar">
      <TeacherSidebar page-title="Reports" />
    </aside>

    <main class="content">
      <div class="content-pad">
        <div class="tab-wrapper reports-tab-wrapper">
          <!-- Tab Headers -->
          <ul class="tab-header" role="tablist">
            <li
              v-for="(tab, index) in tabs"
              :key="tab.title"
              :class="{ 'tab-selected': selectedIndex === index }"
              @click="selectTab(index)"
              role="tab"
              :aria-selected="selectedIndex === index"
            >
              {{ tab.title }}
            </li>
          </ul>

          <!-- Tab Content: render only the active tab for performance -->
          <div class="tab-content" role="tabpanel">
            <!-- Classrooms -->
            <section v-if="selectedIndex === 0" class="class-stats">
              <p><strong>Total number of classrooms:</strong> {{ stats.classrooms.totalClassrooms }}</p>

              <p><strong>List of classrooms:</strong></p>
              <div class="course-list" v-if="classrooms.length">
                <ul>
                  <li v-for="classroom in classrooms" :key="classroom.id">
                    <h5>{{ classroom.name }}</h5>
                    <div class="class-details">
                      <div><strong>ID:</strong> {{ classroom.classroomID }}</div>
                      <div><strong>Number of students:</strong> {{ classroom.students }}</div>
                    </div>
                  </li>
                </ul>
              </div>
              <p v-else>No classrooms found.</p>

              <p><strong>Average number of students per classroom:</strong> {{ stats.classrooms.avgStudentsPerClassroom }}</p>
              <p><strong>Total number of published classrooms:</strong> {{ stats.classrooms.publishedClassrooms }}</p>
              <p><strong>Total number of archived classrooms:</strong> {{ stats.classrooms.archivedClassrooms }}</p>
              <p><strong>Total number of draft classrooms:</strong> {{ stats.classrooms.draftClassrooms }}</p>
            </section>

            <!-- Courses -->
            <section v-if="selectedIndex === 1" class="course-stats">
              <p><strong>Total number of courses:</strong> {{ stats.courses.totalCourses }}</p>

              <p><strong>List of courses:</strong></p>
              <div class="course-list" v-if="courses.length">
                <ul>
                  <li v-for="course in courses" :key="course.id">
                    <h5>{{ course.title || course.name }}</h5>
                    <div class="course-details">
                      <div><strong>ID:</strong> {{ course.id }}</div>
                      <div><strong>Number of students:</strong> {{ course.students }}</div>
                    </div>
                  </li>
                </ul>
              </div>
              <p v-else>No courses found.</p>

              <p><strong>Average number of lessons per course:</strong> {{ stats.courses.avgLessonsPerCourse }}</p>
              <p><strong>Total number of published courses:</strong> {{ stats.courses.publishedCourses }}</p>
              <p><strong>Total number of archived courses:</strong> {{ stats.courses.archivedCourses }}</p>
              <p><strong>Total number of draft courses:</strong> {{ stats.courses.draftCourses }}</p>
            </section>

            <!-- Lessons -->
            <section v-if="selectedIndex === 2" class="lesson-stats">
              <p><strong>Total number of lessons:</strong> {{ stats.lessons.totalLessons }}</p>

              <p @click="console.log(lessons)"><strong>List of lessons:</strong></p>
              <div class="course-list" v-if="lessons.length">
                <ul>
                  <li v-for="lesson in lessons" :key="lesson.id">
                    <h5>{{ lesson.name }}</h5>
                    <div class="lesson-details">
                      <div><strong>ID:</strong> {{ lesson.id }}</div>
                    </div>
                  </li>
                </ul>
              </div>
              <p v-else>No lessons found.</p>

              <p><strong>Average number of credit points per lesson:</strong> {{ stats.lessons.avgCreditPoints }}</p>
              <p><strong>Total number of published lessons:</strong> {{ stats.lessons.publishedLessons }}</p>
              <p><strong>Total number of archived lessons:</strong> {{ stats.lessons.archivedLessons }}</p>
              <p><strong>Total number of draft lessons:</strong> {{ stats.lessons.draftLessons }}</p>
            </section>

            <!-- System (admin only) -->
            <section
              v-if="isAdmin && selectedIndex === adminTabIndex"
              class="system-stats"
              @click="getSystemStats"
            >
              <p><strong>Total number of supervisors:</strong> {{ stats.students.totalSupervisors }}</p>
              <p><strong>Total number of students:</strong> {{ stats.students.totalStudents }}</p>

              <!-- <div class="course-list" v-if="lessons.length">
                <ul>
                  <li v-for="lesson in lessons" :key="lesson.id">
                    <h5>{{ lesson.name }}</h5>
                    <div class="lesson-details">
                      <div><strong>ID:</strong> {{ lesson.id }}</div>
                    </div>
                  </li>
                </ul>
              </div> -->

              <p><strong>Student pass rate across lessons:</strong> {{ stats.system.avgPass }}%</p>
              <p><strong>Student fail rate across lessons:</strong> {{ stats.system.avgFail }}%</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import TeacherSidebar from "../components/teacher-sidebar.vue";
import {
  getLessons,
  getAllCourses,
  getClassrooms,
  getSupervisors,
  getStudents,
  getAllGrades,
} from "../api"; // added missing imports

export default {
  name: "Report",
  components: { TeacherSidebar },
  data() {
    return {
      selectedIndex: 0,
      tabs: [{ title: "Classrooms" }, { title: "Courses" }, { title: "Lessons" }],
      adminTabIndex: 3,
      userRole: "instructor",
      stats: {
        classrooms: {
          totalClassrooms: 0,
          publishedClassrooms: 0,
          archivedClassrooms: 0,
          draftClassrooms: 0,
          avgStudentsPerClassroom: 0,
        },
        courses: {
          totalCourses: 0,
          publishedCourses: 0,
          archivedCourses: 0,
          draftCourses: 0,
          avgLessonsPerCourse: 0,
        },
        lessons: {
          totalLessons: 0,
          publishedLessons: 0,
          archivedLessons: 0,
          draftLessons: 0,
          avgCreditPoints: 0,
        },
        students: {
          totalSupervisors: 0,
          totalStudents: 0,
        },
        system: {
          avgPass: 0,
          avgFail: 0,
        },
      },
      courses: [],
      classrooms: [],
      lessons: [],
    };
  },
  computed: {
    isAdmin() {
      return this.userRole === "admin";
    },
    tabsComputed() {
      // keep original tabs reactive if you ever want to change them programmatically
      return this.isAdmin
        ? [{ title: "Classrooms" }, { title: "Courses" }, { title: "Lessons" }, { title: "System" }]
        : this.tabs;
    },
  },
  methods: {
    selectTab(index) {
      this.selectedIndex = index;
    },
    getSystemStats() {
      // placeholder hook: fetch or compute additional system level stats if required
      console.log("Get system stats");
    },
    computeStats() {
      // Lessons stats
      const lessons = this.lessons || [];
      this.stats.lessons.totalLessons = lessons.length;
      this.stats.lessons.publishedLessons = lessons.filter(l => l.status === "published").length;
      this.stats.lessons.archivedLessons = lessons.filter(l => l.status === "archived").length;
      this.stats.lessons.draftLessons = lessons.filter(l => l.status === "draft").length;
      const totalCredits = lessons.reduce((s, l) => s + (l.credit || 0), 0);
      this.stats.lessons.avgCreditPoints = lessons.length ? (totalCredits / lessons.length).toFixed(2) : 0;

      // Courses stats
      const courses = this.courses || [];
      this.stats.courses.totalCourses = courses.length;
      this.stats.courses.publishedCourses = courses.filter(c => c.status === "published").length;
      this.stats.courses.archivedCourses = courses.filter(c => c.status === "archived").length;
      this.stats.courses.draftCourses = courses.filter(c => c.status === "draft").length;
      const totalLessonsInCourses = courses.reduce((s, c) => s + ((c.lessons && c.lessons.length) || 0), 0);
      this.stats.courses.avgLessonsPerCourse = courses.length ? (totalLessonsInCourses / courses.length).toFixed(2) : 0;

      // Classrooms stats
      const classrooms = this.classrooms || [];
      this.stats.classrooms.totalClassrooms = classrooms.length;
      this.stats.classrooms.publishedClassrooms = classrooms.filter(cl => cl.status === "Published").length;
      this.stats.classrooms.archivedClassrooms = classrooms.filter(cl => cl.status === "Archived").length;
      this.stats.classrooms.draftClassrooms = classrooms.filter(cl => cl.status === "Draft").length;
      const totalStudents = classrooms.reduce((s, cl) => s + (cl.students || 0), 0);
      this.stats.classrooms.avgStudentsPerClassroom = classrooms.length ? (totalStudents / classrooms.length).toFixed(2) : 0;

      // System-level stats (leave unchanged if not computed here)
      // stats.students and stats.system are filled in mounted() via API
    },
  },
  async mounted() {
    // safe parse of localStorage user
    let user = null;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      console.warn("No valid user in localStorage");
    }

    const supervisorEmail = user?.email ?? null;
    // determine role: treat presence of admin email or role value as admin
    if (user?.role === "teacher" && supervisorEmail !== this.$ADMIN_EMAIL) {
      this.userRole = "instructor";
    } else if (user?.role === "admin" || supervisorEmail === this.$ADMIN_EMAIL) {
      this.userRole = "admin";
    } else {
      // default fallback
      this.userRole = user?.role ?? "instructor";
    }

    // set tabs depending on role
    this.tabs = this.isAdmin
      ? [{ title: "Classrooms" }, { title: "Courses" }, { title: "Lessons" }, { title: "System" }]
      : [{ title: "Classrooms" }, { title: "Courses" }, { title: "Lessons" }];

    try {
      // Fetch lessons
      const lessonsRes = await getLessons();
      const allLessons = lessonsRes?.data ?? [];
      console.log("All lessons:", allLessons)
      this.lessons = this.userRole === "instructor" && supervisorEmail
        ? allLessons.filter(l => l.creator === supervisorEmail)
        : allLessons;

      // Fetch courses
      const coursesRes = await getAllCourses();
      const allCourses = coursesRes?.data ?? [];
      const filteredCourses = this.userRole === "instructor" && supervisorEmail
        ? allCourses.filter(c => c.supervisor === supervisorEmail)
        : allCourses;
      // normalize enrolledStudents -> students count
      this.courses = filteredCourses.map(course => ({
        ...course,
        students: Array.isArray(course.enrolledStudents) ? course.enrolledStudents.length : (course.students || 0),
        title: course.title || course.name,
      }));

      // Fetch classrooms
      const classRes = await getClassrooms();
      const allClasses = classRes?.data ?? [];
      const filteredClasses = this.userRole === "instructor" && supervisorEmail
        ? allClasses.filter(cl => cl.supervisor === supervisorEmail)
        : allClasses;
      this.classrooms = filteredClasses.map(cl => ({
        ...cl,
        students: Array.isArray(cl.students) ? cl.students.length : (cl.students || 0),
      }));

      // Fetch supervisors & students for system counts
      const resSupervisors = await getSupervisors();
      this.stats.students.totalSupervisors = (resSupervisors?.data ?? []).length;
      const resStudents = await getStudents();
      this.stats.students.totalStudents = (resStudents?.data ?? []).length;

      // Fetch grades
      const result = await getAllGrades();
      const grades = result.data || [];
      console.log("OBTAINED GRADES:", grades)
      if (grades.length > 0) {
        const allPasses = grades.filter(g => g.grade === "Pass").length;
        const allFailures = grades.filter(g => g.grade === "Fail").length;
        this.stats.system.avgPass = (allPasses / grades.length * 100).toFixed(2);
        this.stats.system.avgFail = (allFailures / grades.length * 100).toFixed(2);
      } else {
        this.stats.system.avgPass = 0;
        this.stats.system.avgFail = 0;
      }


      // compute aggregated stats
      this.computeStats();
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    }
  },
};
</script>

<style scoped>
.layout {
  --sidebar-w: 250px;
  --header-h: 90px;
  --content-pad-x: 1rem;
  --bg: #e3ebff;
  --border: #8895a2;
  background: var(--bg);
  min-height: 100vh;
}

.tab-wrapper {
  width: 100%;
  max-width: 1120px;
}

.tab-header {
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
  border-bottom: 2px solid #ccc;
}

.tab-header li {
  cursor: pointer;
  background: #fff;
  margin-right: 5px;
  transition: background 0.2s;
  flex: 1;
  text-align: center;
  padding: 10px 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
}

.tab-header li:hover {
  background: #eee;
}

.tab-header li.tab-selected {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.tab-content {
  border: 1px solid #ccc;
  border-top: none;
  padding: 20px;
  min-height: 520px;
  background: #fff;
  box-sizing: border-box;
  text-align: left;
}

.tab-content p {
  margin-top: 1rem;
}

.course-list {
  max-height: 210px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 10px;
  background: #f9f9f9;
  margin-top: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #f9f9f9;
}

.course-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.course-list h5 {
  margin: 0 0 0.25rem 0;
}

.course-details,
.class-details,
.lesson-details {
  margin-left: 1rem;
  font-size: 0.95rem;
  color: #333;
}

.course-list li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.course-list li:last-child {
  border-bottom: none;
}
</style>
