// Import your database schema from user.js
import { User } from "../models/User.js";
import { Course } from "../models/Course.js"
import { Lesson } from "../models/Lesson.js"
import { Classroom } from "../models/Classroom.js";

// Registration logic
export const registerUser = async (req, res) => {
  try {
    const { role, title, firstName, lastName, email, password, confirmPassword } = req.body;

    // simple password check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // save to MongoDB
    const newUser = await User.create({
      role,
      title,
      firstName,
      lastName,
      email,
      password,
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    if (err.code === 11000) { // duplicate email
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Error saving user" });
  }
};

// Login logic
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Optionally: issue JWT or session here
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// Get all supervisors (teachers)
export const getSupervisors = async (req, res) => {
  try {
    // Find all users where role is 'teacher'
    const supervisors = await User.find({ role: { $ne: "student" } }).select("firstName lastName email role");

    res.json(supervisors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch supervisors" });
  }
};

// Get all students
export const getStudents = async (req, res) => {
  try {
    // Find all users where role is 'teacher'
    const students = await User.find({ role: "student" }).select("firstName lastName email role");

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch supervisors" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findById(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (deletedUser.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin account" });
    }

    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return res.status(500).json({ message: "No admin found for reassignment" });
    }

    // Initialize update counters (safe for non-instructors)
    let lessonsUpdated = { modifiedCount: 0 };
    let coursesUpdated = { modifiedCount: 0 };
    let classroomsUpdated = { modifiedCount: 0 };

    if (deletedUser.role === "teacher" || deletedUser.role === "instructor") {
      const userEmail = deletedUser.email;
      const adminEmail = admin.email;

      // ---- LESSONS ----
      lessonsUpdated = await Lesson.updateMany(
        { creator: userEmail },
        { $set: { creator: adminEmail } }
      );

      // ---- COURSES ----
      coursesUpdated = await Course.updateMany(
        { supervisor: userEmail },
        { $set: { supervisor: adminEmail } }
      );

      // ---- CLASSROOMS ----
      classroomsUpdated = await Classroom.updateMany(
        { supervisor: userEmail },
        { $set: { supervisor: adminEmail } }
      );

      console.log(
        `✅ Ownership transferred from ${userEmail} to ${adminEmail}:`,
        {
          lessons: lessonsUpdated.modifiedCount,
          courses: coursesUpdated.modifiedCount,
          classrooms: classroomsUpdated.modifiedCount,
        }
      );
    }

    // Delete the user
    await deletedUser.deleteOne();

    res.json({
      message: `User ${deletedUser.email} deleted successfully.${deletedUser.role !== "student" ? " Ownership transferred to admin." : ""}`,
      transferSummary: {
        lessons: lessonsUpdated.modifiedCount || 0,
        courses: coursesUpdated.modifiedCount || 0,
        classrooms: classroomsUpdated.modifiedCount || 0,
      },
      newOwner: admin.email,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

export const markCourseCompleted = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    // Validate course existence
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Update user: add to completedCourses and clear enrolledCourse
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { completedCourses: courseId }, // ensures no duplicates
        $set: { enrolledCourse: null },
      },
      { new: true }
    ).populate("completedCourses", "title id");

    res.status(200).json({
      message: `Course "${course.title}" marked as completed.`,
      completedCourses: updatedUser.completedCourses,
    });
  } catch (err) {
    console.error("Error marking course completed:", err);
    res.status(500).json({ error: err.message });
  }
};