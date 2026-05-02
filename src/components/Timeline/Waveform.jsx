import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import useFFmpeg from '../../hooks/useFFmpeg'; // Remove the named import
import { fetchFile } from '@ffmpeg/util';
import './style.css';

const Waveform = ({ videoSrc, duration, onSeek, currentTime, trimStart, trimEnd, markers }) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const { ffmpeg, ready } = useFFmpeg(); // Now using the default export

  useEffect(() => {
    if (!ready || !videoSrc || !waveformRef.current) return;

    const extractAudio = async () => {
      try {
        const response = await fetch(videoSrc);
        const videoData = await response.arrayBuffer();
        await ffmpeg.writeFile('input.mp4', await fetchFile(new Blob([videoData])));
        
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-vn',
          '-acodec', 'libmp3lame',
          '-q:a', '2',
          'output.mp3'
        ]);
        
        const audioData = await ffmpeg.readFile('output.mp3');
        return new Blob([audioData], { type: 'audio/mp3' });
      } catch (err) {
        console.error('Error extracting audio:', err);
        return null;
      }
    };

    const initWaveform = async () => {
      const audioBlob = await extractAudio();
      if (!audioBlob) return;

      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a90e2',
        progressColor: '#2d5f8b',
        cursorColor: '#fff',
        cursorWidth: 1,
        barWidth: 2,
        barRadius: 3,
        barGap: 1,
        height: 60,
        responsive: true,
        normalize: true,
        partialRender: true
      });

      wavesurferRef.current.load(URL.createObjectURL(audioBlob));
      
      wavesurferRef.current.on('click', () => {
        const time = wavesurferRef.current.getCurrentTime();
        onSeek(time);
      });
    };

    initWaveform();

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [ready, videoSrc, ffmpeg]);

  useEffect(() => {
    if (wavesurferRef.current && currentTime !== undefined) {
      wavesurferRef.current.seekTo(currentTime / duration);
    }
  }, [currentTime, duration]);

  return (
    <div className="waveform-container">
      <div ref={waveformRef} className="waveform" />
      <div className="trim-overlay" style={{
        left: `${(trimStart / duration) * 100}%`,
        width: `${((trimEnd - trimStart) / duration) * 100}%`
      }} />
      {markers.map(marker => (
        <div
          key={marker.id}
          className="waveform-marker"
          style={{
            left: `${(marker.time / duration) * 100}%`,
            backgroundColor: marker.color
          }}
          onClick={() => onSeek(marker.time)}
        />
      ))}
    </div>
  );
};

export default Waveform;