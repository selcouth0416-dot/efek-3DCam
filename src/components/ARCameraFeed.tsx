import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, RefreshCw, FlipHorizontal } from 'lucide-react';

interface ARCameraFeedProps {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  onToggleAR?: () => void;
  onSwitchCamera?: () => void;
  hasMultipleCameras?: boolean;
  onCameraError?: (error: string) => void;
  showHandGuides: boolean;
}

export const ARCameraFeed: React.FC<ARCameraFeedProps> = ({
  isActive,
  facingMode,
  onToggleAR,
  onSwitchCamera,
  hasMultipleCameras,
  onCameraError,
  showHandGuides,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStream, setHasStream] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const requestCameraAccess = async (targetFacing: 'user' | 'environment' = facingMode) => {
    setIsRequesting(true);
    setErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = 'Browser Anda tidak mengizinkan akses kamera langsung. Buka dengan Safari / Chrome.';
      setErrorMsg(err);
      setIsRequesting(false);
      onCameraError?.(err);
      return;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const oldStream = videoRef.current.srcObject as MediaStream;
      oldStream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    try {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: targetFacing },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      if (videoRef.current && stream) {
        const video = videoRef.current;
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.muted = true;
        await video.play().catch(() => {});
        setHasStream(true);
      }
    } catch (err: unknown) {
      const error = err as Error;
      let text = 'Izin kamera ditolak. Buka Pengaturan iPhone > Safari > Kamera > Izinkan.';
      if (error.name === 'NotFoundError') {
        text = 'Kamera tidak ditemukan di perangkat.';
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        text = 'Izin kamera ditolak. Silakan buka Pengaturan HP Anda lalu izinkan kamera untuk Safari.';
      }
      setErrorMsg(text);
      setHasStream(false);
      onCameraError?.(text);
    } finally {
      setIsRequesting(false);
    }
  };

  useEffect(() => {
    if (isActive) {
      requestCameraAccess(facingMode);
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
      setHasStream(false);
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const s = videoRef.current.srcObject as MediaStream;
        s.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isActive, facingMode]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        webkit-playsinline="true"
        muted
        className={`h-full w-full object-cover transition-opacity duration-500 ${
          isActive && hasStream ? 'opacity-100' : 'opacity-0'
        } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
      />

      {(!isActive || !hasStream) && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#14161b] via-[#0c0d10] to-[#050608]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.06)_0%,transparent_65%)]" />
          <div className="absolute top-0 inset-x-0 h-20 border-b border-neutral-800/30 bg-neutral-900/10" />
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      )}

      {/* Tombol Sekali Sentuh Langsung Nyalakan Kamera */}
      {!isActive && (
        <div className="pointer-events-auto absolute top-14 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={() => {
              onToggleAR?.();
              requestCameraAccess(facingMode);
            }}
            className="flex items-center space-x-2 rounded-full border border-emerald-500/50 bg-neutral-950/80 px-4 py-2 text-xs font-semibold text-emerald-300 shadow-xl backdrop-blur-md transition active:scale-95 hover:bg-emerald-950/40"
          >
            <Camera className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span>Nyalakan Kamera AR</span>
          </button>
        </div>
      )}

      {isActive && hasStream && hasMultipleCameras && (
        <div className="pointer-events-auto absolute top-14 right-3 z-20">
          <button
            onClick={() => {
              const nextMode = facingMode === 'environment' ? 'user' : 'environment';
              onSwitchCamera?.();
              requestCameraAccess(nextMode);
            }}
            className="flex items-center space-x-1.5 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-200 shadow-lg backdrop-blur-md active:scale-95"
          >
            <FlipHorizontal className="h-3.5 w-3.5" />
            <span>Putar Kamera</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/85 p-6 text-center z-40">
          <div className="max-w-sm rounded-2xl border border-rose-500/50 bg-neutral-900/95 p-5 text-white shadow-2xl backdrop-blur-md">
            <AlertCircle className="mx-auto mb-2 h-10 w-10 text-rose-500 animate-bounce" />
            <h3 className="font-semibold text-base mb-1">Akses Kamera Terkendala</h3>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">{errorMsg}</p>
            <button
              onClick={() => requestCameraAccess(facingMode)}
              disabled={isRequesting}
              className="flex items-center justify-center space-x-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-semibold text-black mx-auto active:scale-95 transition shadow-md"
            >
              <RefreshCw className={`h-4 w-4 ${isRequesting ? 'animate-spin' : ''}`} />
              <span>{isRequesting ? 'Mencoba...' : 'Coba Buka Kamera Lagi'}</span>
            </button>
          </div>
        </div>
      )}

      {showHandGuides && (
        <div className="absolute inset-0 pointer-events-none flex justify-between items-end px-6 pb-36 opacity-30">
          <div className="h-16 w-16 rounded-full border border-dashed border-cyan-400/50 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <div className="h-16 w-16 rounded-full border border-dashed border-amber-400/50 flex items-center justify-center animate-pulse">
            <div className="h-2 w-2 rounded-full bg-amber-400" />
          </div>
        </div>
      )}
    </div>
  );
};
