import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Timeline from './components/Timeline/Timeline';
import Toolbar from './components/Toolbar/Toolbar';
import './App.css';

function App() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
    }
  };

  const handleSeek = (time) => {
    setCurrentTime(time);
  };

  const handlePlayPause = (playing) => {
    setIsPlaying(playing);
  };

  const handleDuration = (duration) => {
    setDuration(duration);
  };

  return (
    <div className="app">
      <h1>React Video Editor</h1>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleFileUpload} 
        className="file-input"
      />
      
      {videoSrc ? (
        <div className="editor-container">
          <VideoPlayer 
            videoSrc={videoSrc} 
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onDuration={handleDuration}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
          <Timeline 
            videoSrc={videoSrc} 
            onSeek={handleSeek}
            duration={duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
          <Toolbar />
        </div>
      ) : (
        <p className="upload-prompt">Please upload a video file</p>
      )}
    </div>
  );
}

export default App;