import mongoose from "mongoose";

const classroomSchema = new mongoose.Schema({
    classroomID:{ type: String, required: true,unique: true},
    name: {type: String, required: true},
    supervisor: {type: String, required: true},
    status: { type: String, required:true },
    startDate: {type: Date, default: Date.now},
    duration: {type: Number, required: true},
    endDate: {type: Date},
    associatedCourse: [{type:mongoose.Schema.Types.ObjectId, ref:"Course"}],
    selectedLessons: [{type: mongoose.Schema.Types.ObjectId,ref:"Lesson"}],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Collection1"}],
    

    //Optional
    description: {type:String},
    schedule: {type: String},
}, {timestamps:true});

export const Classroom = mongoose.model("Classroom", classroomSchema);