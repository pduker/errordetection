import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/loading-screen.css';
import logo from '../assets/UD-circle-logo-email.png';

export function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const isFirstVisit = useFirstVisit();

  useEffect(() => {
    // Check if we're on the exercises page (including sub-routes)
    const isExercisesPage = location.pathname.startsWith('/exercises');
    const loadingDuration = isExercisesPage ? 250 : 500; // 0.25s for exercises, 0.5s for first visit

    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mark that the user has visited before
      if (!isExercisesPage) {
        localStorage.setItem('hasVisited', 'true');
      }
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (!isLoading) return null;

  // Show full branding on first visit, simple loading on subsequent visits
  if (isFirstVisit) {
    return (
      <div className="loading-indicator">
        <div className="loading-content-compact">
          <div className="logo-container">
            <img src={logo} alt="University of Delaware Logo" className="loading-logo" />
          </div>
          <h1 className="loading-title">University of Delaware</h1>
          <h2 className="loading-subtitle">Aural Skills Error Detection Practice Site</h2>
          <div className="loading-spinner-compact">
            <div className="spinner-compact"></div>
          </div>
          <p className="loading-text-compact">Loading exercises...</p>
        </div>
      </div>
    );
  }

  // Simple loading for subsequent visits
  return (
    <div className="loading-indicator">
      <div className="loading-content-compact">
        <div className="loading-spinner-compact">
          <div className="spinner-compact"></div>
        </div>
        <p className="loading-text-compact">Loading exercises...</p>
      </div>
    </div>
  );
}

export function useFirstVisit(): boolean {
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    setIsFirstVisit(!hasVisited);
  }, []);

  return isFirstVisit;
}
