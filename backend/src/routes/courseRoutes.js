import express from "express";
import { 
  createCourse, 
  deleteCourse, 
  getAllCourses, 
  getCourseById,
  updateCourse, 
  enrollCourse,
  unenrollCourse
} from "../controllers/courseController.js"

const router = express.Router();

// Create new lesson
// Defines the second part of the url (continuation frm server.js)
// of the SERVER url (frontend script needs to request here)
router.post("/", createCourse);

router.get("/", getAllCourses);
router.get("/:id", getCourseById)
router.put("/:id", updateCourse)
router.delete("/:id", deleteCourse);
router.post("/:id/enroll", enrollCourse);
router.patch("/:id/unenroll", unenrollCourse)

// export const enrollInCourse = (courseId, userId) =>
//   api.post(`/api/courses/${courseId}/enroll`, { userId });
// // app.use("/api/courses", courseRoutes)


// // Update by custom lesson id
// router.put("/:id", updateLessonByLessonID);

// // Delete by custom lesson id
// router.delete("/:id", deleteLessonByLessonID);

export default router;


