import { Navigate } from "react-router-dom";
import { getTokenFromCookie, isTokenValid } from "../auth";

export default function AdminRoute({ children }) {
  const token = getTokenFromCookie();

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/auth" replace />;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.is_admin) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/auth" replace />;
  }

  return children;
}