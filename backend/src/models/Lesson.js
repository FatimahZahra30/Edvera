import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },//
  name: { type: String, required: true },//
  description: { type: String, required: true },//
  objectives : {type: String, required:true},
  estimatedEffort:{type:Number,default: 0},
  credit: { type: Number, required: true },//
  creator: { type: String, required: true },//
  status: { type: String, required:true },  //
  prerequisites: { type: [String], default: [], ref: "Lesson" }, 
  reading: { type: String, default: "" }, 
  assignment: { type: String, default: "" }
});


export const Lesson = mongoose.model("Lesson", lessonSchema);
