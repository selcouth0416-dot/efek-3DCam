import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ARCameraFeedProps {
  isActive: boolean;
  facingMode: 'user' | 'environment';
  onCameraError?: (error: string) => void;
  showHandGuides: boolean;
}

export const ARCameraFeed: React.FC<ARCameraFeedProps> = ({
  isActive,
  facingMode,
  onCameraError,
  showHandGuides,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;

    async function startCamera() {
      if (!isActive) {
        if (videoRef.current && videoRef.current.srcObject) {
          const s = videoRef.current.srcObject as MediaStream;
          s.getTracks().forEach((track) => track.stop());
          videoRef.current.srcObject = null;
        }
        return;
      }

      setErrorMsg(null);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMsg('Browser ini tidak mendukung akses kamera langsung.');
        return;
      }

      try {
        // Coba kamera belakang (ideal)
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: facingMode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // Fallback ke kamera default perangkat jika constraint ideal ditolak
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!isMounted) {
          stream?.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current && stream) {
          const video = videoRef.current;
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          video.setAttribute('webkit-playsinline', 'true');
          video.muted = true;
          await video.play().catch(() => {});
        }
      } catch (err: unknown) {
        const error = err as Error;
        let userText = 'Izin kamera ditolak. Buka Pengaturan HP > Safari > Izinkan Kamera.';
        if (error.name === 'NotFoundError') {
          userText = 'Kamera tidak terdeteksi pada perangkat.';
        }
        setErrorMsg(userText);
        if (onCameraError) onCameraError(userText);
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isActive, facingMode, onCameraError]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${
              facingMode === 'user' ? 'scale-x-[-1]' : ''
            }`}
          />

          {errorMsg && (
            <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/85 p-6 text-center z-40">
              <div className="max-w-sm rounded-2xl border border-rose-500/50 bg-neutral-900/95 p-5 text-white shadow-2xl backdrop-blur-md">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-rose-500 animate-bounce" />
                <h3 className="font-semibold text-base mb-1">Akses Kamera Diperlukan</h3>
                <p className="text-xs text-neutral-300 leading-relaxed">{errorMsg}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 flex items-center justify-center space-x-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-black mx-auto active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Muat Ulang Halaman</span>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Studio Room Backdrop */
        <div className="relative h-full w-full bg-gradient-to-b from-[#181a20] via-[#101216] to-[#0a0b0e]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(254,243,199,0.08)_0%,transparent_60%)]" />
          <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-0 inset-x-0 h-24 border-b border-neutral-800/40 bg-neutral-900/20" />
          <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
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
