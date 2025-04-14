import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ role, children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  // eslint-disable-next-line
  const userId = localStorage.getItem("userId");
  // If no token exists, redirect to signin
  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  // If a role is specified and userRole doesn't match, redirect to signin 
  if (role && userRole?.toLowerCase() !== role.toLowerCase()) {
    console.warn(`Role mismatch: Expected ${role}, got ${userRole}`);
    return <Navigate to="/signin" replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
