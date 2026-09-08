import React, { useEffect, useRef, useState } from 'react';

interface ARCameraFeedProps {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  showHandGuides: boolean;
}

export const ARCameraFeed: React.FC<ARCameraFeedProps> = ({
  isActive,
  facingMode,
  showHandGuides,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
        .then((s) => {
          stream = s;
          setHasError(false);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
        })
        .catch((err) => {
          console.warn('Camera error:', err);
          setHasError(true);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, facingMode]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {isActive ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="relative h-full w-full bg-gradient-to-b from-[#181a20] via-[#101216] to-[#0a0b0e]" />
      )}

      {/* Retikel Halus Penanda Posisi Tangan */}
      {showHandGuides && (
        <div className="absolute inset-0 pointer-events-none flex justify-between items-end px-6 sm:px-16 pb-36 sm:pb-20 opacity-30">
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-dashed border-cyan-400/50 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
        </div>
      )}
    </div>
  );
};
