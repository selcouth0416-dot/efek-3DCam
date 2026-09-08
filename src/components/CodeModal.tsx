import React, { useState } from 'react';
import { Code2, Copy, Check, FileCode } from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPO_FILES: { path: string; summary: string; code: string }[] = [
  {
    path: 'src/main.tsx',
    summary: 'Entry point React & Vite',
    code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
  },
  {
    path: 'src/types.ts',
    summary: 'Definisi TypeScript model 3D, tema & kontrol',
    code: `export type HoloModelType = 'lily' | 'dragon' | 'butterfly' | 'bonsai';
export type HandAnchor = 'left' | 'right' | 'dual' | 'free';

export interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  boxColor: string;
  particleColor: string;
  glowColor: string;
  bgColor: string;
}`,
  },
  {
    path: 'src/components/ARCameraFeed.tsx',
    summary: 'Feed kamera AR passthrough belakang/depan tanpa lag',
    code: `import React, { useEffect, useRef } from 'react';

export const ARCameraFeed: React.FC<{
  isActive: boolean;
  facingMode: 'user' | 'environment';
  showHandGuides: boolean;
}> = ({ isActive, facingMode }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isActive) {
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        });
    }
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
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
          className={\`h-full w-full object-cover \${facingMode === 'user' ? 'scale-x-[-1]' : ''}\`}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-b from-[#181a20] to-[#0a0b0e]" />
      )}
    </div>
  );
};`,
  },
  {
    path: 'src/App.tsx',
    summary: 'Komponen utama aplikasi mengintegrasikan AR dan Three.js',
    code: `import React, { useEffect, useRef, useState } from 'react';
import { HoloScene } from './three/HoloScene';
import { TouchDesignerHUD } from './components/TouchDesignerHUD';
import { ARCameraFeed } from './components/ARCameraFeed';
import { HoloModelType, HandAnchor } from './types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const holoSceneRef = useRef<HoloScene | null>(null);
  const [currentModel, setCurrentModel] = useState<HoloModelType>('lily');
  const [currentAnchor, setCurrentAnchor] = useState<HandAnchor>('left');
  const [currentScale, setCurrentScale] = useState<number>(1.0);
  const [isARActive, setIsARActive] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(349);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new HoloScene(containerRef.current);
    holoSceneRef.current = scene;
    return () => scene.destroy();
  }, []);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black select-none text-neutral-100 touch-none">
      <ARCameraFeed isActive={isARActive} facingMode="environment" showHandGuides={true} />
      <div ref={containerRef} className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing touch-none" />
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
        isARActive={isARActive}
        onToggleAR={() => setIsARActive(!isARActive)}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        currentFrame={currentFrame}
        onScrubFrame={(f) => setCurrentFrame(f)}
      />
    </main>
  );
}`,
  },
];

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentFile = REPO_FILES[selectedFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const allCode = REPO_FILES.map(
      (f) => `// ======================\n// File: ${f.path}\n// ======================\n\n${f.code}\n\n`
    ).join('\n');
    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md font-mono text-xs">
      <div className="flex h-[85vh] w-full max-w-4xl flex-col rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/90 px-4 py-2.5">
          <div className="flex items-center space-x-2 text-neutral-200">
            <Code2 className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-sm font-sans">GitHub Repository Source Code</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              className="flex items-center space-x-1 rounded bg-neutral-800 px-2.5 py-1 text-neutral-200 hover:bg-neutral-700 font-sans text-xs"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Salin Semua File</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 border-r border-neutral-800 bg-neutral-950/90 p-2 overflow-y-auto">
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-500 font-semibold">
              Files
            </div>
            <div className="space-y-0.5 mt-1">
              {REPO_FILES.map((file, idx) => (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFile(idx);
                    setCopied(false);
                  }}
                  className={`flex w-full items-center space-x-2 rounded-md px-2.5 py-2 text-left transition ${
                    selectedFile === idx
                      ? 'bg-amber-500/20 text-amber-300 font-medium border border-amber-500/40'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                  }`}
                >
                  <FileCode className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                  <span className="truncate text-xs">{file.path.split('/').pop()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Viewer */}
          <div className="flex flex-1 flex-col overflow-hidden bg-black/70">
            <div className="flex items-center justify-between border-b border-neutral-800/80 bg-neutral-900/50 px-4 py-2">
              <div>
                <span className="text-amber-400 font-medium">{currentFile.path}</span>
                <p className="text-[10px] text-neutral-400">{currentFile.summary}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-1 rounded bg-amber-500/20 border border-amber-500/50 px-2.5 py-1 text-amber-300 hover:bg-amber-500/30 text-xs font-sans"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin File Ini'}</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <pre className="text-neutral-300 text-xs font-mono leading-relaxed select-text">
                <code>{currentFile.code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
