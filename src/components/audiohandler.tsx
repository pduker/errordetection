import { getBlob, getStorage, ref as storageRef } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import '../styles/exercises/audio-player.css';

// Custom audio player with full controls and styling
export default function AudioHandler({ file }: { file: string | File }): JSX.Element {
  const [msgContent] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const storage = getStorage();
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

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
        
        <input
          type="range"
          className="audio-progress"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          disabled={!isLoaded}
        />
        
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
      </div>
      
      {msgContent && <p className="audio-message">{msgContent}</p>}
    </div>
  );
}
