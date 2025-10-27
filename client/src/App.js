// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from './pages/LandingPage'; // --- 1. IMPORT THE NEW LANDING PAGE ---
import LoginPage from "./pages/LoginPage";
import RegisterPage from './pages/RegisterPage'; // Import the new Register Page
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
import EnterMarksPage from './pages/EnterMarksPage'; // <-- ADD THIS
import ViewMarksPage from './pages/ViewMarksPage';   // <-- ADD THIS
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 2. SET THE LANDING PAGE AS THE NEW DEFAULT ROUTE --- */}
        <Route path="/" element={<LandingPage />} />
        
        {/* The login page now has its own dedicated route */}
        <Route path="/login" element={<LoginPage />} />

        {/* --- USE THE REAL REGISTER PAGE COMPONENT --- */}
        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

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
            path="/assignment/:assignmentId/submissions" 
            element={
                <ProtectedRoute>
                    <ViewSubmissions />
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
                    path="/enter-marks"
                    element={
                        <ProtectedRoute>
                            <EnterMarksPage />
                        </ProtectedRoute>
                    }
                />

                {/* Student Route for Viewing Marks */}
                <Route
                    path="/subject/:subjectId/marks"
                    element={
                        <ProtectedRoute>
                            <ViewMarksPage />
                        </ProtectedRoute>
                    }
                />

      </Routes>
    </Router>
  );
}

export default App;
