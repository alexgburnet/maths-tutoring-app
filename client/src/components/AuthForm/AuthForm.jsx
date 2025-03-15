import { useState } from "react";
import { login, register } from "../../api";
import { useNavigate } from "react-router-dom";

export default function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState(""); // 👈 Add name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = isLogin
      ? await login(email, password)
      : await register(name, email, password); // 👈 Pass name too

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