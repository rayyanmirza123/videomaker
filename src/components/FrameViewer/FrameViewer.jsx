import React, { useState, useEffect, useRef } from 'react';
import { FaDownload, FaTrash, FaShare, FaEdit } from 'react-icons/fa';
//import './styles.css';

const FrameViewer = ({ frame, onFrameAction }) => {
  const [annotations, setAnnotations] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState(null);
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Handle new frame
  useEffect(() => {
    if (frame) {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
          ctx.drawImage(img, 0, 0);
          
          // Redraw annotations
          annotations.forEach(ann => {
            drawAnnotation(ctx, ann);
          });
        }
      };
      img.src = frame;
    }
  }, [frame, brightness, contrast, annotations]);

  const drawAnnotation = (ctx, annotation) => {
    if (!annotation || !ctx) return;
    
    ctx.strokeStyle = annotation.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (annotation.type === 'rectangle') {
      ctx.rect(
        annotation.startX * zoom,
        annotation.startY * zoom,
        (annotation.endX - annotation.startX) * zoom,
        (annotation.endY - annotation.startY) * zoom
      );
    } else if (annotation.type === 'arrow') {
      // Draw arrow implementation
    } else if (annotation.type === 'text') {
      // Draw text implementation
    }
    
    ctx.stroke();
  };

  const handleCanvasMouseDown = (e) => {
    if (!frame) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setCurrentAnnotation({
      type: 'rectangle',
      startX: x,
      startY: y,
      endX: x,
      endY: y,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing || !currentAnnotation) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    
    setCurrentAnnotation(prev => ({
      ...prev,
      endX: x,
      endY: y
    }));
    
    // Redraw canvas with updated annotation
    redrawCanvas();
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing && currentAnnotation) {
      setAnnotations(prev => [...prev, currentAnnotation]);
      setIsDrawing(false);
      setCurrentAnnotation(null);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0);
      
      // Draw all saved annotations
      annotations.forEach(ann => {
        drawAnnotation(ctx, ann);
      });
      
      // Draw current annotation in progress
      if (currentAnnotation) {
        drawAnnotation(ctx, currentAnnotation);
      }
    };
    
    img.src = frame;
  };

  const downloadFrame = () => {
    if (!frame) return;
    
    const link = document.createElement('a');
    link.download = `frame-${new Date().toISOString()}.jpg`;
    link.href = frame;
    link.click();
  };

  const clearAnnotations = () => {
    setAnnotations([]);
    redrawCanvas();
  };

  const adjustImage = (type, value) => {
    if (type === 'zoom') {
      setZoom(value);
    } else if (type === 'brightness') {
      setBrightness(value);
    } else if (type === 'contrast') {
      setContrast(value);
    }
    redrawCanvas();
  };

  return (
    <div className="frame-viewer">
      <h3>Frame Viewer</h3>
      
      {frame ? (
        <>
          <div className="frame-container" style={{ transform: `scale(${zoom})` }}>
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />
          </div>
          
          <div className="frame-controls">
            <div className="adjustment-controls">
              <label>
                Zoom:
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => adjustImage('zoom', parseFloat(e.target.value))}
                />
              </label>
              
              <label>
                Brightness:
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => adjustImage('brightness', parseInt(e.target.value))}
                />
              </label>
              
              <label>
                Contrast:
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => adjustImage('contrast', parseInt(e.target.value))}
                />
              </label>
            </div>
            
            <div className="action-buttons">
              <button onClick={downloadFrame} title="Download Frame">
                <FaDownload />
              </button>
              <button onClick={clearAnnotations} title="Clear Annotations">
                <FaTrash />
              </button>
              <button onClick={() => onFrameAction && onFrameAction('share')} title="Share Frame">
                <FaShare />
              </button>
              <button onClick={() => onFrameAction && onFrameAction('edit')} title="Edit Frame">
                <FaEdit />
              </button>
            </div>
          </div>
          
          <div className="annotation-tools">
            <h4>Annotation Tools</h4>
            <div className="tool-options">
              <button className={currentAnnotation?.type === 'rectangle' ? 'active' : ''}
                onClick={() => setCurrentAnnotation({ ...currentAnnotation, type: 'rectangle' })}>
                Rectangle
              </button>
              <button className={currentAnnotation?.type === 'arrow' ? 'active' : ''}
                onClick={() => setCurrentAnnotation({ ...currentAnnotation, type: 'arrow' })}>
                Arrow
              </button>
              <button className={currentAnnotation?.type === 'text' ? 'active' : ''}
                onClick={() => setCurrentAnnotation({ ...currentAnnotation, type: 'text' })}>
                Text
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="no-frame">
          <p>No frame captured yet</p>
          <p>Click "Capture Frame" to extract the current video frame</p>
        </div>
      )}
    </div>
  );
};

export default FrameViewer;