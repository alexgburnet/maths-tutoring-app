import { Link, useLocation, useNavigate } from "react-router-dom";
import { getTokenFromCookie, clearTokenCookie } from "../auth";

export default function Navbar({ loggedIn, setLoggedIn }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onDashboard = location.pathname === "/dashboard";

  const handleLogout = () => {
    clearTokenCookie();
    setLoggedIn(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <h1>
        <Link to="/" style={{ color: "#4f83ff", textDecoration: "none" }}>
          My Tutoring
        </Link>
      </h1>

      <div className="nav-links">
        {!onDashboard && (
          <>
            <a href="#tutoring">Tutoring</a>
            <a href="#about">About Me</a>
            <a href="#contact">Contact</a>
          </>
        )}

        {loggedIn ? (
          <>
            {!onDashboard && <Link to="/dashboard">Dashboard</Link>}
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#e4e4e4",
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
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