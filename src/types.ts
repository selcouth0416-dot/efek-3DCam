export type HoloModelType = 'lily' | 'dragon' | 'butterfly' | 'bonsai';

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
}

export interface RenderQualitySettings {
  pixelRatio: number;
  particleCount: number;
  bloomEnabled: boolean;
  wireframeDetail: 'low' | 'medium' | 'high';
  targetFps: 60 | 30;
}

export interface AudioSettings {
  masterVolume: number;
  muted: boolean;
  sfxEnabled: boolean;
  ambientEnabled: boolean;
}

export interface TimelineState {
  isPlaying: boolean;
  currentFrame: number;
  totalFrames: number;
  fps: number;
  timecodeDisplay: 'timecode' | 'beats';
  rangeLimit: 'Once' | 'Loop';
}
