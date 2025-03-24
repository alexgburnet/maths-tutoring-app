import { useEffect, useRef } from "react";
import "./HomePage.css";

export default function HomePage() {
  const dockRef = useRef(null);

  useEffect(() => {
    const letters = dockRef.current.querySelectorAll(".letter");

    const handleMouseMove = (e) => {
      letters.forEach((letter) => {
        const rect = letter.getBoundingClientRect();
        const letterX = rect.left + rect.width / 2;
        const distance = Math.abs(e.clientX - letterX);
        const maxDistance = 200; // px
        const scale = Math.max(1, 1.5 - distance / maxDistance);
        letter.style.transform = `scale(${scale})`;
      });
    };

    const resetLetters = () => {
      letters.forEach((letter) => {
        letter.style.transform = "scale(1)";
      });
    };

    const dock = dockRef.current;
    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetLetters);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetLetters);
    };
  }, []);

  return (
    <div className="home-page">
      <div className="text-container">
        <h1 className="dock-text" ref={dockRef}>
          {"Alex Burnet".split("").map((char, index) => (
            <span key={index} className="letter">
              {char}
            </span>
          ))}
        </h1>
        <h2>Tutoring</h2>
      </div>
    </div>
  );
}