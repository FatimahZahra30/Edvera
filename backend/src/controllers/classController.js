import { Classroom } from "../models/Classroom.js"
import { User } from "../models/User.js";

export const createClassroom = async (req, res) => {
  try {
    const classroom = new Classroom({
      classroomID: `CLS-${Date.now()}`,
      ...req.body});
    const students = req.body.selectedStudents
    classroom.students = students;
    await classroom.save();
    res.status(201).json(classroom);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find()
    // .populate("selectedLessons", "name credit")
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateClassroomById= async (req, res) => {
  try {
    const { id } = req.params;
    const updatedClassroom = await Classroom.findOneAndUpdate(
      { classroomID :id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.json({ message: "Classroom updated successfully", updatedClassroom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteClassroomById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedClassroom= await Classroom.findOneAndDelete({ classroomID: id });

    if (!deletedClassroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    res.json({ message: "Classroom deleted successfully", deletedClassroom });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/classrooms/:id/enrol
export const enrolStudentInClassroom = async (req, res) => {
  try {
    const { id } = req.params; // classroomID
    const { studentId } = req.body; // student _id

    const classroom = await Classroom.findOne({ classroomID: id });
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    // Prevent enrolment if class already started
    if (classroom.startDate && new Date(classroom.startDate) <= new Date()) {
      return res.status(400).json({ error: "Classroom has already started. Enrolment closed." });
    }

    // Add the student if not already enrolled
    if (!classroom.students.includes(studentId)) {
      classroom.students.push(studentId);
      await classroom.save();
    }

    res.status(200).json({ message: "Student enrolled successfully", classroom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unenrolStudentFromClassroom = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body; 
    const classroom = await Classroom.findOne({ classroomID: id });
    if (!classroom) {
      return res.status(404).json({ error: "Classroom not found" });
    }

    const isEnrolled = classroom.students.some(
      s => s.toString() === studentId.toString()
    );
    if (!isEnrolled) {
      return res.status(400).json({ error: "Student is not enrolled in this classroom" });
    }

    //Remove the student from the classroom
    classroom.students = classroom.students.filter(
      s => s.toString() !== studentId.toString()
    );
    await classroom.save();

    res.status(200).json({
      message: "Student unenrolled successfully",
      classroom,
    });
  } catch (err) {
    console.error("Error unenrolling student:", err);
    res.status(500).json({ error: "Server error" });
  }
};
