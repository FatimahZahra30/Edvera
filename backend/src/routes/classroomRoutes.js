import express from "express";
import { 
  createClassroom,  
  getAllClassrooms, 
  updateClassroomById,
  deleteClassroomById,
  enrolStudentInClassroom,
  unenrolStudentFromClassroom,
} from "../controllers/classController.js"
// import {getAllStudents} from "../controllers/studentController.js"

const router = express.Router();

// Create new lesson
router.post("/", createClassroom);

router.get("/", getAllClassrooms);

// // Update by custom lesson id
router.put("/:id", updateClassroomById);

// // Delete by custom lesson id
router.delete("/:id", deleteClassroomById);

// router.get("/",getAllStudents);

router.post("/:id/enrol",enrolStudentInClassroom)
router.patch("/:id/unenrol", unenrolStudentFromClassroom);


export default router;
