export const extractFrames = async (ffmpeg, videoFile, fps = 10) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-vf', `fps=${fps},scale=160:-1`,
    '-q:v', '2',
    'frame-%04d.jpg'
  ]);
  
  const files = await ffmpeg.listDir('/');
  const frameFiles = files.filter(file => file.name.startsWith('frame-'));
  
  return await Promise.all(
    frameFiles.map(async (file) => {
      const data = await ffmpeg.readFile(file.name);
      return {
        blob: new Blob([data], { type: 'image/jpeg' }),
        time: parseInt(file.name.match(/\d+/)[0]) / fps
      };
    })
  );
};

export const trimVideo = async (ffmpeg, videoFile, startTime, endTime) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  await ffmpeg.exec([
    '-ss', startTime.toString(),
    '-to', endTime.toString(),
    '-i', 'input.mp4',
    '-c', 'copy',
    'output.mp4'
  ]);
  
  const data = await ffmpeg.readFile('output.mp4');
  return new Blob([data], { type: 'video/mp4' });
};