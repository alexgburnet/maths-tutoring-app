import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import { getTokenFromCookie } from "./auth";

function App() {
  const [loggedIn, setLoggedIn] = useState(!!getTokenFromCookie());

  return (
    <Router>
      <nav>
        {!loggedIn ? (
          <>
            <Link to="/">Login</Link> | <Link to="/signup">Sign Up</Link>
          </>
        ) : (
          <Link to="/dashboard">Dashboard</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<LoginForm onLogin={() => setLoggedIn(true)} />} />
        <Route path="/signup" element={<RegisterForm />} />
        <Route path="/dashboard" element={<Dashboard onLogout={() => setLoggedIn(false)} />} />
      </Routes>
    </Router>
  );
}

export default App;