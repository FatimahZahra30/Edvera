import mongoose from "mongoose"

const LoginSchema = new mongoose.Schema({
    role: {
        type:String,
        required: true
    },
    title: {
        type:String, //can use enum, but frontend will still send a string in the end
        required: true 
    },
    firstName: {
        type:String,
        required: true 
    },
    lastName: {
        type:String,
        required: true
    },
    email: {
        type:String,
        required: true,
        unique: true
    },
    password: {
        type:String,
        required: true
    },
    enrolledCourse: {
        type: mongoose.Schema.Types.ObjectId, // Reference to Course
        ref: "Course",  // must match your Course model name
        default: null   // user may not have enrolled yet
    },
    completedCourses: [{
        type: mongoose.Schema.Types.ObjectId, // array of references
        ref: "Course"
    }]

})

export const User = mongoose.model("Collection1",LoginSchema)

