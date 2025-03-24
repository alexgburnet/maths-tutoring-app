// src/routes/AdminRoute.jsx (or wherever you're storing it)

import { Navigate } from "react-router-dom";
import { getTokenFromCookie, isTokenValid, isUserAdmin } from "../services/auth";

export default function AdminRoute({ children }) {
  const token = getTokenFromCookie();

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/auth" replace />;
  }

  if (!isUserAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}