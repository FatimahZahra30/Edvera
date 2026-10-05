import express from "express"
import { getCourseStudents, getAllClassrooms, enrolStudents } from "../controllers/enrolController.js";

const router = express.Router();

router.get("/", getAllClassrooms);
router.post("/", async (req, res, next) => {
  try {
    const { action } = req.body;

    switch (action) {
      case "course":
        return await getCourseStudents(req, res, next);

      case "enrol":
        return await enrolStudents(req, res, next);

      default:
        return res.status(400).json({
          error: `Invalid or missing action. Expected one of: 'classrooms', 'students', 'enrol'`
        });
    }
  } catch (err) {
    console.error("Error in /api/enrol:", err);
    return res
      .status(500)
      .json({ error: err.message || "Internal server error" });
  }
});

export default router;