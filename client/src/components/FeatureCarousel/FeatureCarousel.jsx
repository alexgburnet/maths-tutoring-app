import { features } from '../../data/features';
import './FeatureCarousel.css';

export default function FeatureCarousel() {
  return (
    <div className="carousel">
    <div className="carousel-track">
        {[...features, ...features].map((f, i) => (
        <div className="carousel-card" key={i}>
            <div className="icon">{f.emoji}</div>
            <h4>{f.title}</h4>
            <p>{f.description}</p>
        </div>
        ))}
    </div>
    </div>
  );
}