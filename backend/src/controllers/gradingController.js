import { Grading } from "../models/Grading.js";
import { Classroom } from "../models/Classroom.js";
import { Lesson } from "../models/Lesson.js";
import { User } from "../models/User.js";

export const getAllGrades = async (req, res) => {
  try {
    const grades = await Grading.find()
    res.json(grades)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// export const getGradesForStudent = async (req, res) => {
//   try {
//     const { studentEmail } = req.params;

//     // 1️⃣ Find the user by email to get their MongoDB _id
//     const user = await User.findOne({ email: studentEmail });

//     if (!user) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // 2️⃣ Use that _id to find all grading records for this student
//     const grades = await Grading.find({ student: user._id })
//       .populate("lesson")  // optional — populate lesson details
//       .populate("student"); // optional — populate student details

//     // 3️⃣ Return the found records
//     res.json(grades);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// GET all students in a classroom by classroomID
export const getClassroomStudents = async (req, res) => {
  try {
    const { classroomID } = req.params;

    const classroom = await Classroom.findOne({ classroomID }) // now matches your schema
      .populate("students", "firstName lastName email");

    if (!classroom) return res.status(404).json({ message: "Classroom not found" });
    res.json(classroom.students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET all lessons + grades for a student by email in a classroom
export const getStudentLessons = async (req, res) => {
  try {
    const { studentEmail, classroomID } = req.params;

    // 1️⃣ Find the classroom
    const classroom = await Classroom.findOne({ classroomID })
    .populate("selectedLessons")
    .populate("students");
    if (!classroom) return res.status(404).json({ message: "Classroom not found" });

    // 2️⃣ Find the student object (assumes students are stored as ObjectId references)
    const student = classroom.students.find(s => s.email === studentEmail);
    if (!student) return res.status(404).json({ message: "Student not found in this classroom" });

    const studentId = student._id;

    // 3️⃣ Get all grading records for this student in this classroom
    const gradings = await Grading.find({ student: studentId });

    // 4️⃣ Map lessons and attach grade
    const lessonsWithGrades = classroom.selectedLessons.map(lesson => {
      const gradingRecord = gradings.find(g => g.lesson.toString() === lesson._id.toString());
      return {
        ...lesson.toObject(), // convert mongoose doc to plain JS object
        grade: gradingRecord ? gradingRecord.grade || "Ungraded" : "Ungraded",
        feedback: gradingRecord ? gradingRecord.feedback || "" : ""
      };
    });

    res.json(lessonsWithGrades);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH grade for a student's lesson
export const gradeLesson = async (req, res) => {
  try {
    console.log("Incoming body:", req.body);

    const { lessonID, studentEmail } = req.params;
    const { grade } = req.body;

    // Step 1: Find Lesson and User
    const lesson = await Lesson.findOne({ id: lessonID });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const student = await User.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Step 2: Check if grading record exists
    let grading = await Grading.findOne({ lesson: lesson._id, student: student._id });

    if (!grading) {
      // No existing record — create new one
      grading = new Grading({
        lesson: lesson._id,
        student: student._id,
        grade,
        feedback: "" // empty string as requested
      });

      await grading.save();
      console.log("✅ New grading record created");
    } else {
      // Record exists — update the grade
      grading.grade = grade;
      await grading.save();
      console.log("✅ Grading record updated");
    }


    //res.status(200).json({ message: "Grade saved successfully", grade: grading.grade });
    // // Optional: populate before sending back
    // const populated = await grading.populate("lesson").populate("student");

    // Step 3: Send response
    // res.json(populated);

  } catch (error) {
    console.error("Error in gradeLesson:", error);
    res.status(500).json({ error: error.message });
  }
};


// PATCH feedback for a student's lesson
export const addFeedback = async (req, res) => {
  try {
    const { lessonID, studentEmail } = req.params;
    const { feedback } = req.body;

    // Step 1: Find Lesson and User
    const lesson = await Lesson.findOne({ id: lessonID });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const student = await User.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Step 2: Check if grading record exists
    let grading = await Grading.findOne({ lesson: lesson._id, student: student._id });

     if (!grading) {
      // No existing record — create new one
      grading = new Grading({
        lesson: lesson._id,
        student: student._id,
        grade: 'Ungraded', //the default
        feedback
      });

      await grading.save();
      console.log("✅ New grading record created for feedback");
    } else {
      // Record exists — update the grade
      grading.feedback = feedback;
      await grading.save();
      console.log("✅ Grading record updated for feedback");
    }


    //res.status(200).json({ message: "Feedback saved successfully", feedback: grading.feedback });

  } catch (error) {
    console.error("Error in feedback for lesson:", error);
    res.status(500).json({ error: error.message });
  }
};