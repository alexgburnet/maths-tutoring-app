import { useState } from "react";
import { login, register } from "../api";
import { useNavigate } from "react-router-dom";

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = isLogin
      ? await login(email, password)
      : await register(email, password);

    if (res.token) {
      document.cookie = `token=${res.token}; path=/; max-age=7200`;
      onAuth(); // sets loggedIn=true
      navigate("/dashboard");
    } else {
      alert(res.error || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Log In" : "Sign Up"}</h2>

        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">{isLogin ? "Log In" : "Create Account"}</button>

        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#aaa" }}>
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span
                style={{ color: "#4f83ff", cursor: "pointer" }}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#4f83ff", cursor: "pointer" }}
                onClick={() => setIsLogin(true)}
              >
                Log In
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
}