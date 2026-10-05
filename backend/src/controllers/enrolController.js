import { Course } from "../models/Course.js";
import { Classroom } from "../models/Classroom.js";

export const enrolStudents = async (req, res) => {
  const { classroomId, students } = req.body;

  if (!classroomId || !Array.isArray(students)) {
    return res
      .status(400)
      .json({ error: "classroomId and students[] are required" });
  }

  const classroom = await Classroom.findByIdAndUpdate(
    classroomId,
    { $addToSet: { students: { $each: students } } }, // avoids duplicates
    { new: true }
  ).populate("students", "firstName lastName email _id");

  return res.json({
    message: "Students enrolled successfully",
    classroom
  });
};

/**
 * POST /api/enrol (body-only)
 * Body:
 *  { action: 'classrooms' }                       -> returns all classrooms
 *  { action: 'classrooms', courseId: '<id>' }     -> returns classrooms filtered by courseId
 *
 * This function only handles the classrooms retrieval part.
 */
export const getAllClassrooms = async (req, res) => {
  try {
    const { supervisor, userRole } = req.query; // Changed from req.body to req.query
    
    // Validate supervisor exists
    if (!supervisor) {
      return res.status(400).json({ error: "Supervisor is required" });
    }
    
    let classrooms;

    // Find classrooms by supervisor
    if (userRole === "admin") {
      classrooms = await Classroom.find().lean();
    } else {
      classrooms = await Classroom.find({ supervisor }).lean();
    }

    // Return classrooms (empty array if none found)
    return res.json(classrooms);
    
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/**
 * POST /api/enrol (body-only)
 * Body:
 *  { action: 'students', courseId: '<id>' }
 *  OR
 *  { action: 'students', classroom: { associatedCourse: [ { _id: '<id>' }, ... ] } }
 *
 * This function returns enrolled students for the course associated with the given classroom
 * (reads classroom.associatedCourse[0]._id if needed).
 */
export const getCourseStudents = async (req, res) => {
  try {
    
    let courseId = req.body.courseId || null;
    let classroomId = req.body.classroomId || null;
    
    if (!courseId) {
      return res.status(400).json({
        error: "Missing courseId. Provide { courseId: '<id>' } in request body."
      });
    }

    // Fetch course with full list of enrolled students
    const course = await Course.findById(courseId)
      .populate('enrolledStudents')
      .lean();

    if (!course) {
      return res.status(404).json({ error: `Course not found for id ${courseId}` });
    }

    // Fetch the classroom’s enrolled student IDs only
    const classroom = await Classroom.findById(classroomId)
      .populate("students")

    if (!classroom) {
      return res.status(404).json({ error: `Classroom not found for id ${classroomId}` });
    }

    // Build a Set for fast lookup
    const classroomSet = new Set(
      (classroom.students || []).map(s => s._id.toString())
    );

    // Filter out students who are already in the classroom
    const notInClassroom = (course.enrolledStudents || []).filter(
      s => !classroomSet.has(s._id.toString())
    );



    if (!course) {
      return res.status(404).json({ error: `Course not found for id ${courseId}` });
    }

    return res.status(200).json({
      courseId,
      classroomId,
      students: notInClassroom,
    });

  } catch (err) {
    console.error("=== ERROR in getCourseStudents ===");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    console.error("Stack trace:", err.stack);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
};