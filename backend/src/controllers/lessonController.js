import { Lesson } from "../models/Lesson.js";
import { User } from "../models/User.js";
import { Grading } from "../models/Grading.js"
import { Course } from "../models/Course.js"

// Create Lesson
export const createLesson = async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();
    res.status(201).json(lesson);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().populate('prerequisites');
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// FOR FUTURE USE
// export const getLessonByLessonID = async (req, res) => {
//   try {
//     const { id } = req.params; // uses Lesson ID, NOT mongodb id
//     const lesson = await Lesson.findOne({ id });

//     if (!lesson) {
//       return res.status(404).json({ message: "Lesson not found" });
//     }

//     res.json(lesson);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Uses email cos user has no ID (and localStorage doesn't store Mongodb ID)
export const getLessonsForUser = async (req, res) => {
  try {
    const { userEmail } = req.params; // email instead of _id
    // the parameter here is from the URL!

    // this is based on how the db store it
    const user = await User.findOne({ email: userEmail })
      .populate({
        path: "enrolledCourse",
        populate: { 
          path: "lessons",
          populate: { path: "prerequisites" } 
        }

      })
      .populate({
        path: "completedCourses",
        populate: { 
          path: "lessons",
          populate: { path: "prerequisites" }}
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let lessons = [];

    if (user.enrolledCourse) {
      lessons = lessons.concat(user.enrolledCourse.lessons);
    }

    if (user.completedCourses && user.completedCourses.length > 0) {
      user.completedCourses.forEach(course => {
        lessons = lessons.concat(course.lessons);
      });
    }

    // filtered out the archived and draft lessons
    lessons = lessons.filter(lesson => lesson.status === "published");

    // 4️⃣ Get all grading records for this user in one go
    const gradings = await Grading.find({ student: user._id });

    // 5️⃣ Map lesson._id → grading data for fast lookup
    const gradingMap = new Map();
    gradings.forEach(g => {
      gradingMap.set(g.lesson.toString(), { grade: g.grade, feedback: g.feedback });
    });

    // 6️⃣ Attach grade and feedback to each lesson (if found)
    const lessonsWithGrades = lessons.map(lesson => {
      const grading = gradingMap.get(lesson._id.toString());
      return {
        ...lesson.toObject(),  // ensure plain object
        grade: grading ? grading.grade : null,
        feedback: grading ? grading.feedback : null
      };
    });

    // 7️⃣ Return final result
    res.json(lessonsWithGrades);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Lesson by custom id
export const updateLessonByLessonID = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedLesson = await Lesson.findOneAndUpdate(
      { id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson updated successfully", updatedLesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete Lesson by custom id
export const deleteLessonByLessonID = async (req, res) => {
  try {
    const { id } = req.params; // MUST SEND THE ID!
    const deletedLesson = await Lesson.findOneAndDelete({ id });

    if (!deletedLesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson deleted successfully", deletedLesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
