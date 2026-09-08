import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { HoloModelType, HandAnchor, ThemeConfig } from '../types';
import { soundEngine } from '../audio/soundEngine';

interface TouchDesignerHUDProps {
  currentModel: HoloModelType;
  onSelectModel: (m: HoloModelType) => void;
  currentAnchor: HandAnchor;
  onSelectAnchor: (a: HandAnchor) => void;
  currentScale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  currentTheme: ThemeConfig;
  onSelectTheme: (t: ThemeConfig) => void;
  isARActive: boolean;
  onToggleAR: () => void;
  onSwitchCamera?: () => void;
  hasMultipleCameras?: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentFrame: number;
  onScrubFrame: (frame: number) => void;
}

export const TouchDesignerHUD: React.FC<TouchDesignerHUDProps> = ({
  currentModel,
  onSelectModel,
  currentAnchor,
  onSelectAnchor,
  currentScale,
  onZoomIn,
  onZoomOut,
  onReset,
  isARActive,
  onToggleAR,
  onSwitchCamera,
  hasMultipleCameras,
  isPlaying,
  onTogglePlay,
  currentFrame,
  onScrubFrame,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [rangeLimit, setRangeLimit] = useState<'Once' | 'Loop'>('Once');

  const triggerHaptic = (ms: number = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch {}
    }
  };

  const handleMuteToggle = () => {
    triggerHaptic(12);
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundEngine.setMuted(nextMute);
  };

  const modelsList: { id: HoloModelType; label: string; icon: string }[] = [
    { id: 'lily', label: 'Lily', icon: '🌸' },
    { id: 'dragon', label: 'Naga', icon: '🐉' },
    { id: 'butterfly', label: 'Kupu', icon: '🦋' },
    { id: 'bonsai', label: 'Bonsai', icon: '🎋' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-mono text-xs text-neutral-200">
      {/* 1. Header Atas */}
      <header className="pointer-events-auto flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/75 px-3 py-1.5 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-neutral-200 text-[11px]">._project1/null2</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            id="btn-hud-ar"
            onClick={() => {
              triggerHaptic(20);
              onToggleAR();
            }}
            className={`flex items-center space-x-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition active:scale-95 ${
              isARActive
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                : 'bg-neutral-800 text-neutral-200'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>{isARActive ? 'AR Aktif' : 'AR Kamera'}</span>
          </button>

          {isARActive && hasMultipleCameras && onSwitchCamera && (
            <button
              id="btn-hud-flip-cam"
              onClick={() => {
                triggerHaptic(15);
                onSwitchCamera();
              }}
              className="flex items-center rounded-lg bg-neutral-800 p-1.5 text-neutral-300 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* 2. Mobile Thumb Dock (Ergonomis Jempol HP) */}
      <div className="pointer-events-auto absolute bottom-16 inset-x-2.5 flex flex-col gap-1.5">
        {/* Pilihan 4 Objek 3D */}
        <div className="grid grid-cols-4 gap-1.5 rounded-xl border border-neutral-800/90 bg-neutral-950/85 p-1.5 shadow-2xl backdrop-blur-md">
          {modelsList.map((m) => (
            <button
              key={m.id}
              id={`btn-mobile-model-${m.id}`}
              onClick={() => {
                triggerHaptic(20);
                soundEngine.playSnap();
                onSelectModel(m.id);
              }}
              className={`flex flex-col items-center justify-center rounded-lg py-1.5 transition active:scale-95 ${
                currentModel === m.id
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 shadow-sm font-semibold'
                  : 'bg-neutral-900/70 text-neutral-400'
              }`}
            >
              <span className="text-base leading-none">{m.icon}</span>
              <span className="mt-0.5 text-[10px] truncate">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Posisi Tangan & Zoom */}
        <div className="flex items-center justify-between gap-1.5 rounded-xl border border-neutral-800/90 bg-neutral-950/85 p-1.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-1">
            <button
              id="btn-anchor-left"
              onClick={() => {
                triggerHaptic(15);
                onSelectAnchor('left');
              }}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] transition active:scale-95 ${
                currentAnchor === 'left'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-semibold'
                  : 'bg-neutral-900/80 text-neutral-400'
              }`}
            >
              ✋ Kiri
            </button>
            <button
              id="btn-anchor-free"
              onClick={() => {
                triggerHaptic(15);
                onSelectAnchor('free');
              }}
              className={`rounded-lg px-2 py-1.5 text-[11px] transition active:scale-95 ${
                currentAnchor === 'free'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50 font-semibold'
                  : 'bg-neutral-900/80 text-neutral-400'
              }`}
            >
              🎯 Bebas
            </button>
            <button
              id="btn-anchor-right"
              onClick={() => {
                triggerHaptic(15);
                onSelectAnchor('right');
              }}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] transition active:scale-95 ${
                currentAnchor === 'right'
                  ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 font-semibold'
                  : 'bg-neutral-900/80 text-neutral-400'
              }`}
            >
              ✋ Kanan
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              id="btn-zoom-out"
              onClick={() => {
                triggerHaptic(10);
                onZoomOut();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-300 active:scale-95"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[34px] text-center text-[10px] font-bold text-neutral-300">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              id="btn-zoom-in"
              onClick={() => {
                triggerHaptic(10);
                onZoomIn();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-300 active:scale-95"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
            <button
              id="btn-reset"
              onClick={() => {
                triggerHaptic(15);
                onReset();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-neutral-400 active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Bottom Timeline Bar */}
      <footer className="pointer-events-auto absolute bottom-0 left-0 right-0 border-t border-neutral-800/90 bg-neutral-950/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-1 text-[11px] text-neutral-400">
          <div className="flex items-center space-x-1">
            <span className="text-neutral-500">FPS:</span>
            <span className="font-semibold text-emerald-400">60.0</span>
          </div>

          <div className="flex items-center space-x-1">
            <div className="min-w-[40px] rounded bg-neutral-900 px-1.5 py-0.5 text-center font-mono text-[12px] font-bold text-amber-400">
              {currentFrame}
            </div>

            <div className="flex items-center space-x-0.5 rounded border border-neutral-800 bg-neutral-900 p-0.5">
              <button
                id="btn-transport-prev"
                onClick={() => {
                  triggerHaptic(10);
                  onScrubFrame(Math.max(1, currentFrame - 10));
                }}
                className="rounded p-1 text-neutral-400 active:scale-95"
              >
                <SkipBack className="h-3.5 w-3.5" />
              </button>
              <button
                id="btn-transport-play"
                onClick={() => {
                  triggerHaptic(15);
                  onTogglePlay();
                }}
                className="rounded bg-neutral-800 p-1 text-amber-400 active:scale-95"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button
                id="btn-transport-next"
                onClick={() => {
                  triggerHaptic(10);
                  onScrubFrame(Math.min(600, currentFrame + 10));
                }}
                className="rounded p-1 text-neutral-400 active:scale-95"
              >
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              id="btn-range"
              onClick={() => {
                triggerHaptic(10);
                setRangeLimit(rangeLimit === 'Once' ? 'Loop' : 'Once');
              }}
              className="rounded border border-amber-600/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300"
            >
              {rangeLimit}
            </button>
            <button
              id="btn-mute"
              onClick={handleMuteToggle}
              className="p-1 text-neutral-400"
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
