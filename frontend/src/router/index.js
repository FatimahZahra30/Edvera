import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login.vue'
import Signup from '../views/signup.vue'
import Dashboard from '../views/dashboard.vue' 
import Lessons from '../views/lessons.vue'
import Classrooms from '../views/classrooms.vue'
import Classroom from '../views/classroomDetails.vue'
import Courses from '../views/courses.vue'
import Course from '../views/courseDetails.vue'
import Lesson from '../views/lessonDetails.vue'
import Report from '../views/reports.vue'
import Enrol from '../views/enrol.vue'
import GradingSystem from '../views/grading-system.vue' 
import System from '../views/system.vue'

const routes = [
  { path: '/', redirect: '/signup' },  
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/dashboard', component: Dashboard },
  { path: '/lessons', component: Lessons },
  { path: '/classrooms', component: Classrooms },
  { path: '/courses', component: Courses },
  { path: '/courses/:id', component: Course, props: true },
  { path: '/lessons/:id', component: Lesson, props: true},
  { path: '/classrooms/:id', component: Classroom, props: true },
  { path: '/classrooms/:id/grading', component: GradingSystem, props: true },
  { path: '/reports', component: Report },
  { path: '/enrol', component: Enrol },
  { path: '/grading', component: GradingSystem },
  { path: '/system', component: System},
]

export default createRouter(
    { history: createWebHistory(), 
      routes 
    })

