import mongoose from "mongoose";

const gradingSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Collection1",
        required: true
    },

    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson",
        required: true
    },


    grade: {
        type: String,
        default: ""
    },

    feedback: {
        type: String,
        default: ""
    },

}) 

export const Grading = mongoose.model("Grading", gradingSchema);