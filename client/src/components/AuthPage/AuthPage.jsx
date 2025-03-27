import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AuthPage.css";

import AuthService from "../../services/AuthService";

export default function AuthPage() {

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const initialMode = location.pathname.includes("signup") ? "signup" : "login";
  const [mode, setMode] = useState(initialMode);

  const cardRef = useRef(null);
  const loginRef = useRef(null);
  const signupRef = useRef(null);

  const resize = () => {
    const panel = mode === "login" ? loginRef.current : signupRef.current;
    if (!panel || !cardRef.current) return;

    requestAnimationFrame(() => {
      const height = panel.offsetHeight;
      cardRef.current.style.height = `${height}px`;
    });
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
  
    try {
      await AuthService.login(email, password);
      navigate("/dashboard"); // or wherever
    } catch (err) {
      console.error(err);
      setError(true);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !surname || !email || !password) return;
  
    try {
      await AuthService.register(name, surname, email, password);
      navigate("/dashboard"); // or wherever
    } catch (err) {
      console.error(err);
      setError(true);
    }
  }

  useEffect(() => {
    resize();
    const timeout = setTimeout(resize, 400);
    window.addEventListener("resize", resize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", resize);
    };
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === "login" ? "signup" : "login";
    setMode(newMode);
    setError(false);
    navigate(`/${newMode}`);
  };

  return (
    <div className="auth-page">
      <div className="auth-card" ref={cardRef}>
        <div className={`form-slider ${mode === "signup" ? "shift-left" : ""}`}>
          {/* Login */}
          <div className="form-panel login-panel" ref={loginRef}>
            <h2>Sign In</h2>
            <form className="auth-form" onSubmit={handleLogIn}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Sign In</button>
            </form>
            <div className="auth-toggle">
              <p>
                Don’t have an account?{" "}
                <button type="button" onClick={toggleMode}>Sign up</button>
              </p>
            </div>
            {error && <p className="error-message">Invalid Credentials!</p>}
          </div>

          {/* Signup */}
          <div className="form-panel signup-panel" ref={signupRef}>
            <h2>Create an Account</h2>
            <form className="auth-form" onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
              <p className="note">
                Please use the email you use for Zoom
              </p>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit">Sign Up</button>
            </form>
            <div className="auth-toggle">
              <p>
                Already have an account?{" "}
                <button type="button" onClick={toggleMode}>Sign in</button>
              </p>
            </div>
            {error && <p className="error-message">Invalid Credentials!</p>}
          </div>
        </div>
      </div>
    </div>
  );
}