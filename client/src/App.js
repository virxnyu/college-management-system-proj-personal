// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MarkAttendance from './pages/MarkAttendance';
import ViewAttendance from './pages/ViewAttendance';
import MyAttendancePage from "./pages/MyAttendancePage";
import AdminDashboard from "./pages/AdminDashboard";
import StudentTodo from './components/student/StudentTodo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
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
          path="/my-attendance"
          element={
            <ProtectedRoute role="student">
              <MyAttendancePage />
            </ProtectedRoute>
          }
        />

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
            <ProtectedRoute role="student">
              <StudentTodo />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
