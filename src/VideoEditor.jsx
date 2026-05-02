import React from 'react';
import VideoPlayer from './components/VideoPlayer/VideoPlayer';
import Timeline from './components/Timeline/Timeline';
import Toolbar from './components/Toolbar/Toolbar';
import FrameViewer from './components/FrameViewer/FrameViewer';
//import './styles.css'; // Main styles

const VideoEditor = ({ videoSrc, onSave, onEdit }) => {
  return (
    <div className="video-editor">
      <VideoPlayer src={videoSrc} />
      <Timeline />
      <FrameViewer />
      <Toolbar onSave={onSave} />
    </div>
  );
};

export default VideoEditor;