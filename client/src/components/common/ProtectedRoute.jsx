import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // If no token, redirect to login page
    return <Navigate to="/" />;
  }

  // If token exists, render the child component
  return children;
}

export default ProtectedRoute;
