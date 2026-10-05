import express from "express";
import { 
  createLesson, 
  deleteLessonByLessonID, 
  getLessons, 
  updateLessonByLessonID,
  getLessonsForUser
} from "../controllers/lessonController.js"

const router = express.Router();

// Create new lesson
router.post("/", createLesson);

router.get("/", getLessons);

// Update by custom lesson id
router.put("/:id", updateLessonByLessonID);

// Delete by custom lesson id
router.delete("/:id", deleteLessonByLessonID);

// To display lessons in student page
router.get("/:userEmail/student", getLessonsForUser); // added a lessons so the get user by ID will be different


export default router;
