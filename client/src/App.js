// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import MarkAttendance from './pages/MarkAttendance';
import ViewAttendance from './pages/ViewAttendance';

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

      </Routes>
    </Router>
  );
}

export default App;
// This is the main entry point of the React application.