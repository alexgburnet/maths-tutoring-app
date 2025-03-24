import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "../services/axios";
import {
  getAccessToken,
  setAccessToken,
  isTokenValid,
  isUserAdmin
} from "../services/auth";

export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const token = getAccessToken();

      if (token && isTokenValid(token)) {
        setAuthorized(isUserAdmin());
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post("/refresh", {}, { withCredentials: true });
        const newToken = res.data.access_token;
        setAccessToken(newToken);

        setAuthorized(isUserAdmin()); // Recheck now that token is fresh
      } catch (err) {
        console.warn("🔐 Admin token refresh failed.");
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}