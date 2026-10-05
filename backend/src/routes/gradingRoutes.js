import express from "express";
import {
  getClassroomStudents,
  getStudentLessons,
  gradeLesson,
  addFeedback,
  getAllGrades,
} from "../controllers/gradingController.js";

const router = express.Router();

router.get("/", getAllGrades);


// Get all students in a classroom by classroomID
router.get("/classrooms/:classroomID/students", getClassroomStudents);

// Get all lessons + grades for a student by student email
router.get("/students/:studentEmail/lessons/:classroomID", getStudentLessons);

// Update grade for a student's lesson
router.patch("/lessons/:lessonID/students/:studentEmail/grade", gradeLesson);

// Update or add feedback for a student's lesson
router.patch("/lessons/:lessonID/students/:studentEmail/feedback", addFeedback);

export default router;