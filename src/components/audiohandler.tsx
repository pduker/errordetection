import { getBlob, getStorage, ref as storageRef } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import '../styles/exercises/audio-player.css';

// Hook to detect if device is mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      // const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const isMobileScreen = window.innerWidth < 1100;
      const mobile = isMobileScreen;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Custom audio player with full controls and styling
export default function AudioHandler({ file }: { file: string | File }): JSX.Element {
  const [msgContent] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const storage = getStorage();
  const isMobile = useIsMobile();

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showVolumeOverlay, setShowVolumeOverlay] = useState(false);
  const volumeSliderRef = useRef<HTMLInputElement>(null);
  const volumeOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(audioRef.current?.src) URL.revokeObjectURL(audioRef.current.src);

    if(typeof file === "string") {
      getBlob(storageRef(storage, file)).then((blob: BlobPart) => {
        const fileObject = new File([blob], file, {type: "audio/mpeg"});
        const objectURL = URL.createObjectURL(fileObject);
        if(audioRef.current) {
          audioRef.current.src = objectURL;
          setIsLoaded(true);
        }
      });
    } else {
      const objectURL = URL.createObjectURL(file);
      if(audioRef.current) {
        audioRef.current.src = objectURL;
        setIsLoaded(true);
      }
    }
  }, [file, storage]);

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isLoaded]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  // Attach non-passive event listeners to prevent page scroll when dragging volume
  useEffect(() => {
    const slider = volumeSliderRef.current;
    if (!slider || !showVolumeOverlay) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = slider.getBoundingClientRect();
      const offsetY = touch.clientY - rect.top;
      const percentage = 1 - (offsetY / rect.height);
      const newVolume = Math.max(0, Math.min(1, percentage));

      const audio = audioRef.current;
      if (audio) {
        audio.volume = newVolume;
        setVolume(newVolume);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = slider.getBoundingClientRect();
      const offsetY = touch.clientY - rect.top;
      const percentage = 1 - (offsetY / rect.height);
      const newVolume = Math.max(0, Math.min(1, percentage));

      const audio = audioRef.current;
      if (audio) {
        audio.volume = newVolume;
        setVolume(newVolume);
      }
    };

    slider.addEventListener('touchstart', handleTouchStart, { passive: false });
    slider.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      slider.removeEventListener('touchstart', handleTouchStart);
      slider.removeEventListener('touchmove', handleTouchMove);
    };
  }, [showVolumeOverlay]);

  // Close volume overlay when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Close if click is outside overlay and not on the volume button
      if (volumeOverlayRef.current && !volumeOverlayRef.current.contains(target)) {
        const volumeButton = document.querySelector('.audio-volume-btn');
        if (volumeButton && !volumeButton.contains(target)) {
          setShowVolumeOverlay(false);
        }
      }
    };

    if (showVolumeOverlay) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVolumeOverlay]);

  const toggleVolumeOverlay = () => {
    setShowVolumeOverlay(!showVolumeOverlay);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} preload="metadata" />

      <div className="audio-controls">
        <div className="audio-buttons-group">
          <button
            className="audio-play-btn"
            onClick={togglePlayPause}
            disabled={!isLoaded}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>

          <div className="audio-time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>

          {/* Mobile volume button */}
          {isMobile && (
            <button
              className="audio-volume-btn"
              onClick={toggleVolumeOverlay}
              disabled={!isLoaded}
            >
              🔊
            </button>
          )}
        </div>

        <input
          type="range"
          className="audio-progress"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!isLoaded}
        />

        {/* Desktop horizontal volume slider */}
        {!isMobile && (
          <div className="audio-volume-section">
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              className="audio-volume"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        )}

        {/* Mobile vertical volume overlay */}
        {isMobile && showVolumeOverlay && (
          <div ref={volumeOverlayRef} className="audio-volume-overlay">
            <input
              ref={volumeSliderRef}
              type="range"
              className="audio-volume-vertical"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        )}
      </div>

      {msgContent && <p className="audio-message">{msgContent}</p>}
    </div>
  );
}
