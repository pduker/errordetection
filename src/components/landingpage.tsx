import React from "react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-card">
        <h1>Aural Skills Error Detection</h1>
        <p>
          Practice identifying mistakes in real musical excerpts. 
          <br /> Jump straight into the exercise bank whenever you are ready.
        </p>
        <Link to="/exercises" className="landing-button">
          Go to Exercises
        </Link>
      </div>
    </div>
  );
}
