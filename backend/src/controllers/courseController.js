import { Course } from "../models/Course.js";
import { User } from "../models/User.js";
import { Classroom } from "../models/Classroom.js"


export const createCourse = async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      const field = Object.keys(err.keyValue)[0];  // e.g., 'id' or 'code'
      const value = err.keyValue[field];
      return res.status(400).json({
        error: `A course with ${field} '${value}' already exists. Please use a different ${field}.`
      });
    }
    // Other errors
    res.status(400).json({ error: err.message });
  }
};



export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("lessons")

    // If no courses are found, return a 404
    if (!courses) {
      return res.status(404).json({ error: "Courses not found" });
    }

    const coursesWithExtras = courses.map(c => {
    const course = c.toObject(); // Convert first!

    const totalCredits = course.lessons
  .filter(lesson => lesson.status === "published") // only include published lessons
  .reduce((sum, lesson) => sum + (lesson.credit || 0), 0);

    console.log(totalCredits)

    return {
      ...course,
      credits: totalCredits,
    };
  });

    
    

    res.json(coursesWithExtras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



export const getCourseById = async (req, res) => {
  const { id } = req.params;

  try {
    const course = await Course.findById(id)
    .populate("lessons").populate("enrolledStudents", "email"); // include lessons

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // calculate total credits
    const totalCredits = course.lessons
  .filter(lesson => lesson.status === "published") // only include published lessons
  .reduce((sum, lesson) => sum + (lesson.credit || 0), 0);

    console.log(totalCredits)

    // send course with extra info
    res.json({
      ...course.toObject(),
      credits: totalCredits,
      enrolledStudents:course.enrolledStudents,
      // lessonCount: course.lessons.length    dont know if want number of lessons yet
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// // Update Course by custom id
// export const updateCourse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const updatedCourse = await Course.findOneAndUpdate(
//       { id },          // match by your custom course ID
//       req.body,        // new data from request body
//       { new: true, runValidators: true } // return updated doc, enforce schema validation
//     ).populate("lessons");

//     if (!updatedCourse) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     // calculate credits like in getCourseById
//     const totalCredits = updatedCourse.lessons.reduce(
//       (sum, lesson) => sum + (lesson.credit || 0),
//       0
//     );

//     res.json({
//       message: "Course updated successfully",
//       updatedCourse: {
//         ...updatedCourse.toObject(),
//         credits: totalCredits
//       }
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Update Course by custom id
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the existing course first
    const existingCourse = await Course.findOne({ id }).lean();
    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    let hasChanges = false;
    for (const key in req.body) {
      const newVal = req.body[key];
      const oldVal = existingCourse[key];

      if (Array.isArray(newVal) && Array.isArray(oldVal)) {
        if (newVal.length !== oldVal.length || !newVal.every((v, i) => v == oldVal[i])) {
          hasChanges = true;
          break;
        }
      } else if (newVal != oldVal) {
        hasChanges = true;
        break;
  }
}

    // Prepare update data
    const updateData = {
      ...req.body,
      ...(hasChanges ? { updatedAt: Date.now() } : {}) // only set if something changed
    };

    const updatedCourse = await Course.findOneAndUpdate(
      { id },
      updateData,
      { new: true, runValidators: true }
    )
    // .populate("lessons");

    // Recalculate credits
  const totalCredits = updatedCourse.lessons
  .filter(lesson => lesson.status === "published") // only include published lessons
  .reduce((sum, lesson) => sum + (lesson.credit || 0), 0);

    res.json({
      message: "Course updated successfully",
      updatedCourse: {
        ...updatedCourse.toObject(),
        credits: totalCredits
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({ id });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseObjectId = course._id;

    // Use custom 'id' field instead of _id
    await Course.findOneAndDelete({ _id: courseObjectId });

    await Promise.all([
      // Remove as enrolled course
      User.updateMany(
        { enrolledCourse: courseObjectId },
        { $set: { enrolledCourse: null } }
      ),
      User.updateMany(
        { completedCourses: courseObjectId },
        { $pull: { completedCourses: courseObjectId } }
      ),

      // Optional: clean up classrooms that reference this course
      Classroom.updateMany(
        { associatedCourse: courseObjectId },
        { $set: { associatedCourse: null } }
      )
    ]);

    res.status(200).json({
      message: `Course '${course.title}' deleted successfully. All enrolled students are now unenrolled.`,
      deletedCourseId: id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Enroll a user in a course
export const enrollCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params; 
    const { userId } = req.body;        

    // Find course
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find user
    const user = await User.findById(userId)
    // .populate("enrolledCourse");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Already enrolled?
    if (user.enrolledCourse) {
      return res.status(400).json({ error: "User is already enrolled in a course" });
    }

    // Update both sides
    user.enrolledCourse = course._id;
    await user.save();

    course.enrolledStudents.push(user._id);
    await course.save();

    res.json({
      message: `User enrolled in ${course.title} successfully`,
      user,
    });
  } catch (err) {
    console.error("Error enrolling user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Enroll a user in a course
export const unenrollCourse = async (req, res) => {
  try {
    const { id: courseId } = req.params; 
    const { userId } = req.body;   
    
    console.log(courseId)
    console.log(userId) //objectID!

    // Find course
    const course = await Course.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find user
    const user = await User.findById(userId)
    // .populate("enrolledCourse");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // // Already enrolled?
    // if (user.enrolledCourse) {
    //   return res.status(400).json({ error: "User is already enrolled in a course" });
    // }

    // Update both sides
    user.enrolledCourse = null;
    await user.save();

    await Course.findByIdAndUpdate(
      course._id,
      { $pull: { enrolledStudents: userId } },
      { new: true }
    );

    await Classroom.updateMany(
      { associatedCourse: { $in: [course._id] } },
      { $pull: { students: userId } }
    );

    res.json({
      message: `User unenrolled in ${course.title} successfully`,
      user,
    });
  } catch (err) {
    console.error("Error unenrolling user:", err);
    res.status(500).json({ error: "Server error" });
  }
};
