import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    id: {
        type:String,
        required: true,
        unique: true
    },
    title: {
        type:String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    status: { 
        type: String, 
        required: true 
    },
    
    supervisor: {
        type:String,
        required: true,
    },
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Lesson",
        },
    ],
    //should have total lessons, total credit points
    enrolledStudents: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "Collection1",
        }
    ]

})

export const Course = mongoose.model("Course", courseSchema);


