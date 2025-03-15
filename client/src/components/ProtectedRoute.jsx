import { Navigate } from "react-router-dom";
import { getTokenFromCookie } from "../auth";

export default function ProtectedRoute({ children }) {
  const token = getTokenFromCookie();

  return token ? children : <Navigate to="/auth" replace />;
}