export const API_BASE_URL = "http://localhost:5000/api"; // Base URL for API calls

export const SKILLS = [
  "React",
  "Python",
  "Communication",
  "JavaScript",
  "Project Management",
  "Design",
  "Data Analysis",
  "Marketing",
  "Writing",
  "Video Editing",
]; // List of skills available for verification

export const USER_ROLES = {
  STUDENT: "Student",
  CLIENT: "Client",
  ADMIN: "Admin",
}; // User roles in the application

export const JOB_STATUSES = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  CLOSED: "Closed",
}; // Possible statuses for job postings

export const INTERVIEW_STATUS = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  PASSED: "Passed",
  FAILED: "Failed",
}; // Statuses for interview evaluations

export const NOTIFICATION_TYPES = {
  JOB_MATCH: "Job Match",
  INTERVIEW_REVIEW: "Interview Review",
}; // Types of notifications sent to users