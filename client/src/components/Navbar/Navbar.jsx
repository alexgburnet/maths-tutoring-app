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
    <nav className={`navbar ${menuOpen ? "menu-open" : ""}`}>
      <h1>
        <Link to="/" style={{ color: "#4f83ff", textDecoration: "none" }}>
          Alex Burnet - Tutoring
        </Link>
      </h1>

      <div className="hamburger" onClick={toggleMenu}>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open" : ""}`}></div>
      </div>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {!onDashboard && (
          <>
            <Link to="/#tutoring" onClick={() => setMenuOpen(false)}>Tutoring</Link>
            <Link to="/#about" onClick={() => setMenuOpen(false)}>Me</Link>
            <Link to="/#contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          </>
        )}

        {loggedIn && isUserAdmin() && (
          <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link>
        )}

        {loggedIn ? (
          <>
            {!onDashboard && (
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            )}
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </>
        ) : (
          <Link to="/auth" onClick={() => setMenuOpen(false)}>Login</Link>
        )}
      </div>
    {menuOpen && <div className="nav-blur-overlay" onClick={() => setMenuOpen(false)} />}
    </nav>
  );
}