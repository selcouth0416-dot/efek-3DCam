import React, { useEffect, useRef, useState } from 'react';
import { HoloScene } from './three/HoloScene';
import { TouchDesignerHUD } from './components/TouchDesignerHUD';
import { ARCameraFeed } from './components/ARCameraFeed';
import { HoloModelType, HandAnchor, ThemeConfig } from './types';
import { HOLO_THEMES } from './data/themes';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const holoSceneRef = useRef<HoloScene | null>(null);

  const [currentModel, setCurrentModel] = useState<HoloModelType>('lily');
  const [currentAnchor, setCurrentAnchor] = useState<HandAnchor>('left');
  const [currentScale, setCurrentScale] = useState<number>(1.0);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(HOLO_THEMES[0]);

  // Otomatis deteksi HP untuk menggunakan kamera belakang
  const isMobileDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  const [isARActive, setIsARActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>(isMobileDevice ? 'environment' : 'user');
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentFrame, setCurrentFrame] = useState<number>(349);

  // Inisialisasi engine Three.js
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new HoloScene(containerRef.current, {
      onModelChanged: (m) => setCurrentModel(m),
      onAnchorChanged: (a) => setCurrentAnchor(a),
      onScaleChanged: (s) => setCurrentScale(s),
    });
    holoSceneRef.current = scene;

    // Cek ketersediaan multiple kamera
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      });
    }

    return () => {
      scene.destroy();
    };
  }, []);

  // Animasi timeline frame TouchDesigner
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev >= 600 ? 1 : prev + 1));
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black select-none text-neutral-100 touch-none">
      {/* 1. Feed Kamera AR Passthrough */}
      <ARCameraFeed
        isActive={isARActive}
        facingMode={cameraFacing}
        showHandGuides={true}
      />

      {/* 2. Kanvas 3D Three.js Touch Interaktif */}
      <div
        ref={containerRef}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* 3. HUD TouchDesigner & Kontrol Jempol HP */}
      <TouchDesignerHUD
        currentModel={currentModel}
        onSelectModel={(m) => {
          setCurrentModel(m);
          holoSceneRef.current?.setModel(m);
        }}
        currentAnchor={currentAnchor}
        onSelectAnchor={(a) => {
          setCurrentAnchor(a);
          holoSceneRef.current?.setAnchor(a);
        }}
        currentScale={currentScale}
        onZoomIn={() => holoSceneRef.current?.zoomIn()}
        onZoomOut={() => holoSceneRef.current?.zoomOut()}
        onReset={() => holoSceneRef.current?.resetTransform()}
        currentTheme={currentTheme}
        onSelectTheme={(t) => {
          setCurrentTheme(t);
          holoSceneRef.current?.setTheme(t);
        }}
        isARActive={isARActive}
        onToggleAR={() => setIsARActive(!isARActive)}
        onSwitchCamera={() => setCameraFacing((prev) => (prev === 'user' ? 'environment' : 'user'))}
        hasMultipleCameras={hasMultipleCameras}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentFrame={currentFrame}
        onScrubFrame={(f) => setCurrentFrame(f)}
      />
    </main>
  );
}
