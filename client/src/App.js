// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage';
import LoginPage from "./pages/LoginPage";
import RegisterPage from './pages/RegisterPage';
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MarkAttendance from './pages/MarkAttendance';
import ViewAttendance from './pages/ViewAttendance';
import AdminDashboard from "./pages/AdminDashboard";
import StudentTodo from './components/student/StudentTodo';
import StudentSubjectAttendance from "./components/student/StudentSubjectAttendance";
import MyAttendance from './pages/MyAttendance';
import StudentAssignments from './pages/StudentAssignments';
import ViewSubmissions from './pages/ViewSubmissions';
import SubjectNotesPage from "./pages/SubjectNotesPage";
import EnterMarksPage from './pages/EnterMarksPage';
import ViewMarksPage from './pages/ViewMarksPage';
import ViewAnnouncementsPage from './pages/ViewAnnouncementsPage';
import './index.css';

function App() {
	return (
		<Router>
			<Routes>
				{/* --- LANDING / AUTH ROUTES --- */}
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* --- DASHBOARD --- */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				{/* --- TEACHER ROUTES --- */}
				<Route
					path="/mark-attendance"
					element={
						<ProtectedRoute>
							<MarkAttendance />
						</ProtectedRoute>
					}
				/>
				<Route path="/view-attendance" element={<ViewAttendance />} />
				<Route
					path="/admin-dashboard"
					element={
						<ProtectedRoute>
							<AdminDashboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/enter-marks"
					element={
						<ProtectedRoute>
							<EnterMarksPage />
						</ProtectedRoute>
					}
				/>

				{/* --- STUDENT UTILITY ROUTES --- */}
				<Route
					path="/student-todo"
					element={
						<ProtectedRoute>
							<StudentTodo />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/student/subject-attendance"
					element={
						<ProtectedRoute>
							<StudentSubjectAttendance />
						</ProtectedRoute>
					}
				/>
				
				{/* --- STUDENT SUBJECT-SPECIFIC VIEWS --- */}
				<Route path="/my-attendance/:subjectId" element={<ProtectedRoute> <MyAttendance /> </ProtectedRoute>} />
				
				<Route
					path="/my-assignments"
					element={
						<ProtectedRoute>
							<StudentAssignments />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/subject/:subjectId/notes"
					element={
						<ProtectedRoute>
							<SubjectNotesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/subject/:subjectId/marks"
					element={
						<ProtectedRoute>
							<ViewMarksPage />
						</ProtectedRoute>
					}
				/>
				
				
				<Route
					path="/subject/:subjectId/announcements"
					element={
						<ProtectedRoute>
							<ViewAnnouncementsPage />
						</ProtectedRoute>
					}
				/>
				
				<Route
					path="/assignment/:assignmentId/submissions"
					element={
						<ProtectedRoute>
							<ViewSubmissions />
						</ProtectedRoute>
					}
				/>

			</Routes>
		</Router>
	);
}

export default App;
