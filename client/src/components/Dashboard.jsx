import { useEffect, useState } from "react";
import { getTokenFromCookie, clearTokenCookie } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ onLogout }) {
  const [email, setEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getTokenFromCookie();
    if (!token) {
      navigate("/");
      return;
    }

    // Decode JWT payload (basic way)
    const payload = JSON.parse(atob(token.split(".")[1]));
    setEmail(payload.email || "Logged In");
  }, []);

  const handleLogout = () => {
    clearTokenCookie();
    onLogout();
    navigate("/");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome {email} 🎉</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}