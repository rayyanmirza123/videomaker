import { useState, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const useFFmpeg = () => {
  const [ffmpeg, setFFmpeg] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const ffmpegInstance = new FFmpeg({
          coreURL: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
          log: true,
          progress:true,
        });
        
        ffmpegInstance.on('log', ({ message }) => {
          console.log(message);
        });
        
        ffmpegInstance.on('progress', ({ progress: p }) => {
          setProgress(Math.round(p * 100));
        });
        
        await ffmpegInstance.load();
        
        setFFmpeg(ffmpegInstance);
        setReady(true);
      } catch (err) {
        setError(err);
      }
    };

    loadFFmpeg();
    
    return () => {
      if (ffmpeg) {
        ffmpeg.off('log');
        ffmpeg.off('progress');
      }
    };
  }, []);

  return { ffmpeg, ready, error, progress };
};

export default useFFmpeg;