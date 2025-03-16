import { useState } from "react";
import { login, register } from "../../api";
import { useNavigate } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    // Check required fields during registration
    if (!isLogin && (!name || !surname || !email || !password)) {
      setError("Please fill in all fields.");
      return;
    }
  
    const res = isLogin
      ? await login(email, password)
      : await register(name, surname, email, password);
  
    if (res.token) {
      document.cookie = `token=${res.token}; path=/; max-age=7200`;
      onAuth();
      navigate("/dashboard");
    } else {
      setError(res.error || "Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <h2>{isLogin ? "Log In" : "Sign Up"}</h2>

        {!isLogin && (
          <input
            type="text"
            placeholder="Your Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}

        {!isLogin && (
          <>
            <input
              type="text"
              placeholder="Your Surname"
              required
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
            />
          </>
        )}

        {!isLogin && (
          <p className="email-prompt">Please use the email you wish to use with Zoom</p>
        )}

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
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                style={{ color: "#4f83ff", cursor: "pointer" }}
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
              >
                Log In
              </span>
            </>
          )}
        </p>

        {error && (
          <p style={{ color: "#ff6b6b", marginTop: "0.5rem" }}>{error}</p>
        )}
      </form>
    </div>
  );
}