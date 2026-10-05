import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors" ;
import lessonRoutes from "./routes/lessonRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import courseRoutes from "./routes/courseRoutes.js"
import classroomRoutes from "./routes/classroomRoutes.js"
import enrolRoutes from "./routes/enrolRoutes.js"
import gradingRoutes from "./routes/gradingRoutes.js";

dotenv.config();
const app = express();
app.use(express.json()) // needed for database
app.use(cors())
app.use(express.urlencoded({extended: true })) 


const PORT = process.env.PORT || 5001

connectDB();

app.use("/api/lessons", lessonRoutes);
app.use("/auth", userRoutes) // remember that GET SUPERVISORS use this!!
// configures the first part of the URL on server side
app.use("/api/courses", courseRoutes)
app.use("/api/classrooms", classroomRoutes)
app.use("/api/enrol", enrolRoutes)

app.use("/api/grading", gradingRoutes); 

app.use("/api/users",userRoutes);

app.listen(PORT, () => {
    console.log("Server started on Port:", PORT);
})

