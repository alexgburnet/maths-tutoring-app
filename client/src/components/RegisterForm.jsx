import { useState } from "react";
import { register } from "../api";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = await register(email, password);
    if (data.message) {
      alert("Registered successfully. Now log in!");
    } else {
      alert(data.error || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Sign Up</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button type="submit">Sign Up</button>
    </form>
  );
}