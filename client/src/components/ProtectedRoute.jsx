import { Navigate } from "react-router-dom";
import { getTokenFromCookie, isTokenValid } from "../services/auth";

export default function ProtectedRoute({ children }) {
  const token = getTokenFromCookie();

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}