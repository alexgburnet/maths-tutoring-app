import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../services/axios";
import {
  getAccessToken,
  setAccessToken,
  isTokenValid
} from "../services/auth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const validateOrRefreshToken = async () => {
      const token = getAccessToken();

      if (token && isTokenValid(token)) {
        setAuthorized(true);
        setLoading(false);
        return;
      }

      try {
        // Try to refresh the access token using the HttpOnly refresh cookie
        const res = await axios.post("/refresh", {}, { withCredentials: true });
        const newToken = res.data.access_token;
        setAccessToken(newToken);
        setAuthorized(true);
      } catch (err) {
        console.warn("🔐 Token refresh failed, redirecting to login.");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    validateOrRefreshToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!authorized) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}