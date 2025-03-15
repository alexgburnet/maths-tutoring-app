import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ marginBottom: "2rem" }}>Oops! Page not found.</p>
      <Link to="/" style={{ color: "#4f83ff" }}>Go back home</Link>
    </div>
  );
}