import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center"}}
    >
      <div
        style={{textAlign: "center"}}
      >
        <h1>404</h1>
        <p>Oops! Page not found.</p>
        <Link to="/">Go back home</Link>
      </div>
    </div>
  );
}