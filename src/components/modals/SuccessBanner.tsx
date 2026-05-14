import React, { useEffect, useState } from 'react';

interface SuccessBannerProps {
  show: boolean;
  message: string;
  onClose: () => void;
}

export function SuccessBanner({ show, message, onClose }: SuccessBannerProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (show) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`success-banner-overlay ${isExiting ? 'exiting' : ''}`}>
      <div className="success-banner">
        <div className="success-banner-content">
          <span className="success-message">{message}</span>
        </div>
      </div>
    </div>
  );
}
