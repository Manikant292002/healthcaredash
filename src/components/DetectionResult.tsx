import React, { useRef, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { DiseaseDetectionResult } from '../types';

interface DetectionResultProps {
  result: DiseaseDetectionResult;
  imageUrl: string;
  onPositionChange?: (position: { x: number; y: number; width: number; height: number; confidence: number }) => void;
}

export function DetectionResult({ result, imageUrl, onPositionChange }: DetectionResultProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();
  const isDraggingRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState(result.position || { x: 0.2, y: 0.3, width: 0.3, height: 0.2 });
  const [isAnimating, setIsAnimating] = useState(false);
  const lastPositionRef = useRef(position);
  const animationStartTimeRef = useRef(0);
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const ANIMATION_DURATION = 300;
  const MOMENTUM_FACTOR = 0.92;
  const VELOCITY_SCALE = 0.15;

  const statusColors = {
    Healthy: 'bg-green-100 text-green-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    Critical: 'bg-red-100 text-red-800'
  };

  // Handle image load and resize
  const handleImageLoad = () => {
    if (!imageRef.current || !canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;

    // Calculate aspect ratio
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerRatio = containerWidth / containerHeight;

    let width, height;
    if (aspectRatio > containerRatio) {
      width = containerWidth;
      height = containerWidth / aspectRatio;
    } else {
      height = containerHeight;
      width = containerHeight * aspectRatio;
    }

    // Update canvas size
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    
    // Store image size for calculations
    setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
  };

  const calculateConfidence = (x: number, y: number, width: number, height: number) => {
    // Calculate distance from center of image
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Calculate distance from optimal position (center of image)
    const distanceFromCenter = Math.sqrt(
      Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2)
    );

    // Calculate box coverage relative to image size
    const coverage = (width * height) / (imageSize.width * imageSize.height);
    const optimalCoverage = 0.15; // 15% of image is optimal
    const coverageFactor = 1 - Math.abs(coverage - optimalCoverage) / optimalCoverage;

    // Calculate position factor (closer to center is better)
    const positionFactor = 1 - Math.min(distanceFromCenter / 0.5, 1);

    // Combine factors with weights
    const weightedScore = (positionFactor * 0.6 + coverageFactor * 0.4);

    // Map to 61-80 range
    const confidence = 61 + Math.round(weightedScore * 19);

    // Ensure confidence stays within bounds
    return Math.max(61, Math.min(80, confidence));
  };

  const updateDetectionResult = (newX: number, newY: number) => {
    const confidence = calculateConfidence(newX, newY, position.width, position.height);
    const newPosition = { ...position, x: newX, y: newY };
    
    setPosition(newPosition);
    
    if (onPositionChange) {
      onPositionChange({
        ...newPosition,
        confidence
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((e.clientX - rect.left) * scaleX) / canvas.width;
    const y = ((e.clientY - rect.top) * scaleY) / canvas.height;

    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    velocityRef.current = { x: 0, y: 0 };

    if (x >= position.x && x <= position.x + position.width &&
        y >= position.y && y <= position.y + position.height) {
      isDraggingRef.current = true;
      startPosRef.current = { x: x - position.x, y: y - position.y };
      setIsAnimating(false);
      canvas.style.cursor = 'grabbing';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = ((e.clientX - rect.left) * scaleX) / canvas.width;
    const y = ((e.clientY - rect.top) * scaleY) / canvas.height;

    velocityRef.current = {
      x: (e.clientX - lastMousePosRef.current.x) * VELOCITY_SCALE,
      y: (e.clientY - lastMousePosRef.current.y) * VELOCITY_SCALE
    };
    
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    const newX = Math.max(0, Math.min(1 - position.width, x - startPosRef.current.x));
    const newY = Math.max(0, Math.min(1 - position.height, y - startPosRef.current.y));

    lastPositionRef.current = position;
    updateDetectionResult(newX, newY);
  };

  const handleMouseUp = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsAnimating(true);
      animationStartTimeRef.current = Date.now();

      if (canvasRef.current) {
        canvasRef.current.style.cursor = 'grab';
      }

      const applyMomentum = () => {
        if (!isDraggingRef.current && (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01)) {
          const newX = Math.max(0, Math.min(1 - position.width, position.x + velocityRef.current.x / canvasRef.current!.width));
          const newY = Math.max(0, Math.min(1 - position.height, position.y + velocityRef.current.y / canvasRef.current!.height));

          updateDetectionResult(newX, newY);
          
          velocityRef.current = {
            x: velocityRef.current.x * MOMENTUM_FACTOR,
            y: velocityRef.current.y * MOMENTUM_FACTOR
          };

          requestAnimationFrame(applyMomentum);
        }
      };

      requestAnimationFrame(applyMomentum);
    }
  };

  const lerp = (start: number, end: number, t: number) => {
    return start * (1 - t) + end * t;
  };

  const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0
      ? 0
      : x === 1
      ? 1
      : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || !image.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let glowIntensity = 0;
    let startTime = Date.now();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      let currentPosition = position;

      if (isAnimating) {
        const elapsed = Date.now() - animationStartTimeRef.current;
        const progress = Math.min(elapsed / ANIMATION_DURATION, 1);
        const easeProgress = easeOutElastic(progress);

        if (progress >= 1) {
          setIsAnimating(false);
        } else {
          currentPosition = {
            ...position,
            x: lerp(lastPositionRef.current.x, position.x, easeProgress),
            y: lerp(lastPositionRef.current.y, position.y, easeProgress)
          };
        }
      }

      const x = canvas.width * currentPosition.x;
      const y = canvas.height * currentPosition.y;
      const width = canvas.width * currentPosition.width;
      const height = canvas.height * currentPosition.height;

      const elapsedTime = Date.now() - startTime;
      glowIntensity = Math.sin(elapsedTime * 0.002) * 0.5 + 0.5;
      
      const shadowSize = 10 + (result.details.severity * 2);
      ctx.shadowColor = result.color;
      ctx.shadowBlur = shadowSize * glowIntensity;
      
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      const baseColor = result.color.replace('0.5', `${0.3 + (glowIntensity * 0.2)}`);
      gradient.addColorStop(0, baseColor);
      gradient.addColorStop(1, result.color.replace('0.5', `${0.4 + (glowIntensity * 0.3)}`));
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, width, height);

      ctx.strokeStyle = result.color.replace('0.5', '0.8');
      ctx.lineWidth = 2 + glowIntensity;
      ctx.strokeRect(x, y, width, height);

      const handleSize = Math.max(6, Math.min(8, canvas.width / 100));
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;

      [[x, y], [x + width, y], [x + width, y + height], [x, y + height]].forEach(([hx, hy]) => {
        ctx.beginPath();
        ctx.arc(hx, hy, handleSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });

      const confidence = calculateConfidence(currentPosition.x, currentPosition.y, currentPosition.width, currentPosition.height);
      
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.lineWidth = 3;
      
      const fontSize = Math.max(14, Math.min(canvas.width / 40, 24));
      ctx.font = `bold ${fontSize}px sans-serif`;
      
      const text = `${result.disease} (${confidence}%)`;
      const textX = x;
      const textY = y - fontSize / 2;
      
      ctx.strokeText(text, textX, textY);
      ctx.fillText(text, textX, textY);

      const severityText = `Severity: ${result.details.severity}/10`;
      ctx.font = `${Math.max(12, Math.min(canvas.width / 50, 20))}px sans-serif`;
      ctx.fillText(severityText, x, y + height + fontSize);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [result, imageUrl, position, isAnimating]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 animate-scale-in">
      <div className="flex flex-col space-y-4">
        <div className="relative" ref={containerRef}>
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Medical scan"
            className="hidden"
            onLoad={handleImageLoad}
          />
          <div className="relative w-full aspect-[4/3] bg-gray-50 rounded-lg overflow-hidden animate-fade-in">
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full object-contain cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
          <div className="absolute top-2 right-2 animate-slide-up">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[result.status]} animate-pulse-glow`}>
              {result.status}
            </span>
          </div>
          <div className="absolute bottom-2 left-2 text-sm text-gray-600">
            Drag the detection box to adjust position
          </div>
        </div>
        
        <div className="mt-4 animate-slide-up">
          <h3 className="text-lg font-semibold flex items-center mb-3">
            {result.status === 'Healthy' ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 animate-pulse" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 animate-pulse" />
            )}
            Detection Results
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 hover-lift">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{result.disease}</span>
                <span className="text-sm text-gray-500">
                  Severity: {result.details.severity}/10
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full progress-line"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Confidence: {result.confidence}%
              </p>
            </div>
          </div>

          {result.details.explanation && (
            <div className="mt-4 animate-fade-in">
              <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-blue-500" />
                AI Explanation
              </h4>
              <div className="text-sm text-gray-600">
                {result.details.explanation.features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-1 hover-lift"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span>{feature}</span>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full progress-line"
                        style={{ width: `${result.details.explanation.importance[index] * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}