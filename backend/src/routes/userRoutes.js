import express from "express"
import { registerUser, loginUser, getSupervisors, getStudents, deleteUser, markCourseCompleted} from "../controllers/userController.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/supervisors", getSupervisors);
router.get("/students", getStudents);
router.delete("/users/:id", deleteUser);
router.patch("/:userId/complete/:courseId", markCourseCompleted);
export default router;