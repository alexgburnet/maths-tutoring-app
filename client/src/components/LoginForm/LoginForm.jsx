import { login } from "../../api";
import { useNavigate } from "react-router-dom";
import { getTokenFromCookie } from "../../auth";
import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    if (data.token) {
      document.cookie = `token=${data.token}; path=/; max-age=7200`;
      onLogin();
      navigate("/dashboard");
    } else {
      alert(data.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Log In</button>
    </form>
  );
}