import React, { useRef, useEffect, useState } from 'react';
import FrameViewer from '../FrameViewer/FrameViewer';
import './style.css';

const VideoPlayer = ({ 
  videoSrc, 
  currentTime, 
  onTimeUpdate, 
  onDuration, 
  isPlaying = false, 
  onPlayPause = () => {} 
}) => {
  const videoRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(null);

  useEffect(() => {
    if (!videoRef.current) return;

    const handleLoadedMetadata = () => {
      if (onDuration) {
        onDuration(videoRef.current.duration);
      }
    };

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, [videoSrc]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (currentTime !== undefined) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  useEffect(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.play().catch(e => console.error('Playback failed:', e));
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (onTimeUpdate && videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const extractCurrentFrame = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setCurrentFrame(canvas.toDataURL('image/jpeg'));
  };

  const handlePlayPause = () => {
    if (typeof onPlayPause === 'function') {
      onPlayPause(!isPlaying);
    } else {
      // Fallback if onPlayPause isn't provided
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    }
  };

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        controls={false}
        src={videoSrc}
        onTimeUpdate={handleTimeUpdate}
        onClick={handlePlayPause}
      />
      
      <div className="player-controls">
        <button onClick={handlePlayPause}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={extractCurrentFrame}>
          Capture Frame
        </button>
        <span className="time-display">
          {formatTime(currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}
        </span>
      </div>

      <FrameViewer frame={currentFrame} />
    </div>
  );
};

const formatTime = (seconds) => {
  const date = new Date(0);
  date.setSeconds(seconds);
  return date.toISOString().substr(11, 8);
};

export default VideoPlayer;