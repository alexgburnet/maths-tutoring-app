import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTokenFromCookie, clearTokenCookie, isUserAdmin } from "../../auth";
import "./Navbar.css";

export default function Navbar({ loggedIn, setLoggedIn }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const onDashboard = location.pathname === "/dashboard";

  const handleLogout = () => {
    clearTokenCookie();
    setLoggedIn(false);
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className="navbar">
      <h1>
        <Link to="/" style={{ color: "#4f83ff", textDecoration: "none" }}>
          Alex Burnet - Tutoring
        </Link>
      </h1>

      <div className="hamburger" onClick={toggleMenu}>
        <div className={menuOpen ? "bar open" : "bar"}></div>
        <div className={menuOpen ? "bar open" : "bar"}></div>
        <div className={menuOpen ? "bar open" : "bar"}></div>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {!onDashboard && (
          <>
            <a href="#tutoring">Tutoring</a>
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
          </>
        )}

        {loggedIn && isUserAdmin() && <Link to="/admin">Admin</Link>}

        {loggedIn ? (
          <>
            {!onDashboard && <Link to="/dashboard">Dashboard</Link>}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth">Login</Link>
        )}
      </div>
    </nav>
  );
}