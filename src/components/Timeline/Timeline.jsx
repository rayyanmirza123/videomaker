import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaStepBackward, FaStepForward, FaPlay, FaPause, FaPlus } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';
import useFFmpeg from '../../hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { v4 as uuidv4 } from 'uuid';
import Waveform from './Waveform';
import './style.css';

const Timeline = ({ 
  videoSrc, 
  duration = 0, 
  onSeek = () => {}, 
  onTrim = () => {}, 
  currentTime = 0, 
  isPlaying = false, 
  onPlayPause = () => {} 
}) => {
  const { ffmpeg, ready, progress } = useFFmpeg();
  const [frames, setFrames] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [markers, setMarkers] = useState([]);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(duration);
  const timelineRef = useRef(null);

  // Generate thumbnails at different zoom levels
  const generateThumbnails = useCallback(async () => {
    if (!ffmpeg || !ready || !videoSrc) return;

    setIsGenerating(true);
    try {
      const response = await fetch(videoSrc);
      const videoData = await response.arrayBuffer();
      await ffmpeg.writeFile('input.mp4', await fetchFile(new Blob([videoData])));

      // Adjust fps based on zoom level
      const fps = Math.min(10, Math.max(1, Math.round(zoom)));
      
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `fps=${fps},scale=160:-1`,
        '-q:v', '2',
        'thumb-%04d.jpg'
      ]);

      const files = await ffmpeg.listDir('/');
      const thumbFiles = files.filter(file => file.name.startsWith('thumb-'));
      
      const thumbnails = await Promise.all(
        thumbFiles.map(async (file) => {
          const data = await ffmpeg.readFile(file.name);
          const time = parseInt(file.name.match(/\d+/)[0]) / fps;
          return {
            id: uuidv4(),
            url: URL.createObjectURL(new Blob([data], { type: 'image/jpeg' })),
            time
          };
        })
      );

      setFrames(thumbnails);
    } catch (err) {
      console.error('Error generating thumbnails:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [ffmpeg, ready, videoSrc, zoom]);

  // Handle zoom changes
  useEffect(() => {
    if (duration > 0) {
      generateThumbnails();
    }
  }, [zoom, duration, generateThumbnails]);

  // Update trimEnd when duration changes
  useEffect(() => {
    setTrimEnd(duration);
  }, [duration]);

  // Add marker at current position
  const addMarker = useCallback(() => {
    setMarkers(prev => [
      ...prev,
      {
        id: uuidv4(),
        time: currentTime,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        label: `Marker ${markers.length + 1}`
      }
    ]);
  }, [currentTime, markers.length]);

  // Handle frame navigation
  const goToFrame = (direction) => {
    if (!frames.length) return;
    
    const currentIndex = frames.findIndex(f => Math.abs(f.time - currentTime) < 0.1);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1);
    } else {
      newIndex = Math.min(frames.length - 1, currentIndex + 1);
    }
    
    onSeek(frames[newIndex].time);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key) {
        case ' ':
          onPlayPause(!isPlaying);
          break;
        case 'ArrowLeft':
          goToFrame('prev');
          break;
        case 'ArrowRight':
          goToFrame('next');
          break;
        case 'm':
          addMarker();
          break;
        default:
          return;
      }
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, frames, currentTime]);

  // Format time for display
  const formatTime = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  };

  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <button 
          onClick={() => onPlayPause(!isPlaying)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button 
          onClick={() => goToFrame('prev')}
          aria-label="Previous frame"
        >
          <FaStepBackward />
        </button>
        <button 
          onClick={() => goToFrame('next')}
          aria-label="Next frame"
        >
          <FaStepForward />
        </button>
        <button 
          onClick={addMarker}
          aria-label="Add marker"
        >
          <FaPlus /> Marker
        </button>
        <div className="zoom-controls">
          <span>Zoom:</span>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            aria-label="Timeline zoom level"
          />
          <span>{zoom.toFixed(1)}x</span>
        </div>
        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="timeline" ref={timelineRef}>
        <div className="frames-track">
          {isGenerating ? (
            <div className="loading">
              Generating thumbnails... {progress}%
              <progress value={progress} max="100" />
            </div>
          ) : (
            frames.map((frame) => (
              <div
                key={frame.id}
                className={`frame ${Math.abs(frame.time - currentTime) < 0.1 ? 'active' : ''}`}
                onClick={() => onSeek(frame.time)}
                style={{ width: `${100 / frames.length * zoom}%` }}
                aria-label={`Frame at ${frame.time.toFixed(1)} seconds`}
              >
                <img 
                  src={frame.url} 
                  alt={`Frame at ${frame.time.toFixed(1)}s`} 
                  loading="lazy"
                />
                <div className="frame-time">{frame.time.toFixed(1)}s</div>
                {markers.map(marker => (
                  Math.abs(marker.time - frame.time) < 0.1 && (
                    <div
                      key={marker.id}
                      className="marker"
                      style={{ backgroundColor: marker.color }}
                      title={marker.label}
                    />
                  )
                ))}
              </div>
            ))
          )}
        </div>

        <Waveform
          videoSrc={videoSrc}
          duration={duration}
          onSeek={onSeek}
          currentTime={currentTime}
          trimStart={trimStart}
          trimEnd={trimEnd}
          markers={markers}
        />
      </div>

      <div className="trim-controls">
        <div className="trim-range">
          <label>
            Start:
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={trimStart}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setTrimStart(value);
                onTrim(value, trimEnd);
              }}
            />
            <span>{formatTime(trimStart)}</span>
          </label>
          <label>
            End:
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={trimEnd}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setTrimEnd(value);
                onTrim(trimStart, value);
              }}
            />
            <span>{formatTime(trimEnd)}</span>
          </label>
        </div>
        <div className="trim-duration">
          Duration: {formatTime(trimEnd - trimStart)}
        </div>
      </div>
    </div>
  );
};

export default Timeline;