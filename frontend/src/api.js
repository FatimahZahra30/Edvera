// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001",
});

// Expose functions
export function registerUser(data) {
  return api.post("auth/signup", data);
}

export function loginUser(data) {
  return api.post("auth/login", data);
}

export const getSupervisors = () => api.get("auth/supervisors");
export const getStudents = () => api.get("auth/students");
export const deleteUser = (userId) => api.delete(`/auth/users/${userId}`);
 
// this requests SERVER url (take from server and routes url)
export const getLessons = () => api.get("/api/lessons");
export const createLesson = (data) => api.post("/api/lessons", data);
export const deleteLesson = (id) => api.delete(`/api/lessons/${id}`);
export const updateLesson = (id, data) => api.put(`/api/lessons/${id}`, data);
// get lesson for user in the backend
export const getLessonsForStudent = (email) => api.get(`/api/lessons/${email}/student`);


export const getAllCourses = () => api.get("/api/courses");
export const createCourse = (data) => api.post("/api/courses", data);
export const getCourseById = (id) => api.get(`/api/courses/${id}`);
export const updateCourse = (id, payload) => api.put(`/api/courses/${id}`, payload)
export const removeCourse = (id) => api.delete(`/api/courses/${id}`);
//edit the student database
export const enrollInCourse = (courseId, userId) =>
  api.post(`/api/courses/${courseId}/enroll`, { userId });
export const unenrollInCourse = (courseId, userId) =>
  api.patch(`/api/courses/${courseId}/unenroll`, { userId });

  
export const getClassrooms = () => api.get("/api/classrooms");
export const createClassroom = (data) => api.post("/api/classrooms", data);
export const deleteClassroom = (id) => api.delete(`/api/classrooms/${id}`);
export const updateClassroom = (id, data) => api.put(`/api/classrooms/${id}`, data);
export const enrollInClassroom = (classroomID, userId) =>
  api.post(`/api/classrooms/${classroomID}/enrol`, { studentId:userId });
export const unenrolStudentFromClassroom = (classroomID, studentId) =>
  api.patch(`/api/classrooms/${classroomID}/unenrol`, { studentId });

export const getCourseStudents = (body) => api.post("/api/enrol", body);
export const getAllClassrooms = (query) => api.get("/api/enrol", { 
  params: query 
});

export const enrolStudents = (body) => api.post("/api/enrol", body);

//-------------- GRADING ---------------
// Get all students in a classroom by classroomID
export const getClassroomStudents = (classroomID) => 
  api.get(`/api/grading/classrooms/${classroomID}/students`);

export const getStudentLessons = (studentEmail, classroomID) =>
  api.get(`/api/grading/students/${encodeURIComponent(studentEmail)}/lessons/${encodeURIComponent(classroomID)}`);

// Update grade for a student's lesson
export const updateGrade = (lessonID, studentEmail, payload) =>
  api.patch(`/api/grading/lessons/${lessonID}/students/${studentEmail}/grade`, payload);

// Update or add feedback for a student's lesson
export const updateFeedback = (lessonID, studentEmail, payload) =>
  api.patch(`/api/grading/lessons/${lessonID}/students/${studentEmail}/feedback`, payload);

export const getAllGrades = () => api.get("/api/grading");

//--------------END OF GRADING------------------------

// PROGRESS
export const getCourseProgress = (courseId, studentEmail) =>
  api.get(`/api/courses/${courseId}/progress`, { params: { student: studentEmail } });

export const setLessonProgress = (courseId, lessonId, studentEmail, status) =>
  api.put(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
    student: studentEmail,
    status, // 'completed' | 'not_completed'
  });

export const markCourseCompleted = (userId, courseId) =>
  api.patch(`/api/users/${userId}/complete/${courseId}`);
export default api;



