import * as THREE from 'three';
import { HoloModelType, HandAnchor, RenderQualitySettings } from '../types';
import { BoundingBox } from './models/BoundingBox';
import { LilyModel } from './models/LilyModel';
import { DragonModel } from './models/DragonModel';
import { ButterflyModel } from './models/ButterflyModel';
import { BonsaiModel } from './models/BonsaiModel';
import { ParticleVFX } from './models/ParticleVFX';
import { soundEngine } from '../audio/soundEngine';

export class HoloScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  public holoRoot: THREE.Group;
  private boundingBox: BoundingBox;
  private particleVFX: ParticleVFX;

  // Models
  private lily: LilyModel;
  private dragon: DragonModel;
  private butterfly: ButterflyModel;
  private bonsai: BonsaiModel;
  private currentModelType: HoloModelType = 'lily';

  // Transform & Anchor
  private currentAnchor: HandAnchor = 'left';
  private targetPosition: THREE.Vector3 = new THREE.Vector3(-1.1, 0.1, 0.2);
  private currentScale: number = 1.0;
  private targetScale: number = 1.0;

  // Touch & Drag state
  private isDragging: boolean = false;
  private previousPointerPosition = { x: 0, y: 0 };
  private rotationVelocity = { x: 0, y: 0 };

  // Mobile Gyroscope
  private gyroOffset = { x: 0, y: 0 };
  private gyroActive = false;
  private onOrientationHandler?: (e: DeviceOrientationEvent) => void;

  private animId: number | null = null;
  private isDestroyed: boolean = false;

  private onModelChanged?: (model: HoloModelType) => void;
  private onAnchorChanged?: (anchor: HandAnchor) => void;

  constructor(
    container: HTMLElement,
    options?: {
      onModelChanged?: (model: HoloModelType) => void;
      onAnchorChanged?: (anchor: HandAnchor) => void;
    }
  ) {
    this.container = container;
    this.onModelChanged = options?.onModelChanged;
    this.onAnchorChanged = options?.onAnchorChanged;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const isMobilePortrait = width < height;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, isMobilePortrait ? 0.25 : 0, isMobilePortrait ? 6.2 : 5.2);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.style.touchAction = 'none';
    container.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    this.scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(3, 5, 4);
    this.scene.add(dirLight);

    // Root Hologram
    this.holoRoot = new THREE.Group();
    this.updateAnchorTarget('left');
    this.holoRoot.position.copy(this.targetPosition);
    this.scene.add(this.holoRoot);

    // Bounding Box SOP & Partikel
    this.boundingBox = new BoundingBox(2.2, 0xffffff);
    this.holoRoot.add(this.boundingBox.group);
    this.particleVFX = new ParticleVFX(1800, 0xf43f5e);
    this.holoRoot.add(this.particleVFX.points);

    // 4 Model 3D
    this.lily = new LilyModel();
    this.dragon = new DragonModel();
    this.butterfly = new ButterflyModel();
    this.bonsai = new BonsaiModel();

    this.holoRoot.add(this.lily.group);
    this.holoRoot.add(this.dragon.group);
    this.holoRoot.add(this.butterfly.group);
    this.holoRoot.add(this.bonsai.group);

    this.dragon.group.visible = false;
    this.butterfly.group.visible = false;
    this.bonsai.group.visible = false;

    this.initInteraction();
    this.initGyroscope();
    window.addEventListener('resize', this.onResize);
    this.animate();
  }

  private initGyroscope() {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return;
    this.onOrientationHandler = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const normX = Math.max(-1, Math.min(1, e.gamma / 35));
        const normY = Math.max(-1, Math.min(1, (e.beta - 45) / 35));
        this.gyroOffset.x = normX * 0.35;
        this.gyroOffset.y = normY * 0.25;
        this.gyroActive = true;
      }
    };
    window.addEventListener('deviceorientation', this.onOrientationHandler);
  }

  public setModel(model: HoloModelType) {
    if (this.currentModelType === model) return;
    this.particleVFX.triggerDisintegrate(this.holoRoot.position, 0xf59e0b);
    this.currentModelType = model;
    this.lily.group.visible = model === 'lily';
    this.dragon.group.visible = model === 'dragon';
    this.butterfly.group.visible = model === 'butterfly';
    this.bonsai.group.visible = model === 'bonsai';
    this.onModelChanged?.(model);
  }

  public setAnchor(anchor: HandAnchor) {
    this.currentAnchor = anchor;
    this.updateAnchorTarget(anchor);
    this.onAnchorChanged?.(anchor);
  }

  private updateAnchorTarget(anchor: HandAnchor) {
    const isPortrait = window.innerWidth < window.innerHeight;
    const xDist = isPortrait ? 0.65 : 1.15;
    const yOff = isPortrait ? 0.25 : 0.15;

    switch (anchor) {
      case 'left':
        this.targetPosition.set(-xDist, yOff, 0.2);
        break;
      case 'right':
        this.targetPosition.set(xDist, yOff, 0.2);
        break;
      case 'dual':
        this.targetPosition.set(0, isPortrait ? 0.05 : -0.2, 0.3);
        break;
      case 'free':
        this.targetPosition.set(0, isPortrait ? 0.3 : 0.2, 0);
        break;
    }
  }

  public zoomIn() {
    this.targetScale = Math.min(this.targetScale + 0.2, 2.4);
    soundEngine.playZoom();
  }

  public zoomOut() {
    this.targetScale = Math.max(this.targetScale - 0.2, 0.4);
    soundEngine.playZoom();
  }

  public resetTransform() {
    this.targetScale = 1.0;
    this.holoRoot.rotation.set(0, 0, 0);
    this.rotationVelocity = { x: 0, y: 0 };
    soundEngine.playAnchorSwitch();
  }

  private initInteraction() {
    const dom = this.renderer.domElement;

    // Pointer Drag Rotasi
    dom.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
      soundEngine.startHum();
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      this.rotationVelocity.y = deltaX * 0.005;
      this.rotationVelocity.x = deltaY * 0.005;

      this.holoRoot.rotation.y += this.rotationVelocity.y;
      this.holoRoot.rotation.x += this.rotationVelocity.x;

      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Touch Pinch & Double Tap
    let initialDistance: number | null = null;
    let initialScale = 1;
    let lastTap = 0;

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
        initialScale = this.targetScale;
      }
    });

    dom.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2 && initialDistance) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        this.targetScale = Math.max(0.4, Math.min(2.4, initialScale * (dist / initialDistance)));
      }
    });

    dom.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTap < 300 && e.touches.length === 0) {
        this.resetTransform();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(20);
        }
      }
      lastTap = now;
      initialDistance = null;
    });
  }

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const isPortrait = width < height;

    this.camera.aspect = width / height;
    this.camera.position.set(0, isPortrait ? 0.25 : 0, isPortrait ? 6.2 : 5.2);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.updateAnchorTarget(this.currentAnchor);
  };

  private animate = () => {
    if (this.isDestroyed) return;
    this.animId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // Lerp Posisi dengan Giroskop
    const targetWithGyro = this.targetPosition.clone();
    if (this.gyroActive) {
      targetWithGyro.x += this.gyroOffset.x;
      targetWithGyro.y -= this.gyroOffset.y;
    }
    this.holoRoot.position.lerp(targetWithGyro, delta * 6);

    // Lerp Skala
    this.currentScale = THREE.MathUtils.lerp(this.currentScale, this.targetScale, delta * 8);
    this.holoRoot.scale.set(this.currentScale, this.currentScale, this.currentScale);

    // Inersia Rotasi
    if (!this.isDragging) {
      this.rotationVelocity.x *= 0.94;
      this.rotationVelocity.y *= 0.94;
      this.holoRoot.rotation.x += this.rotationVelocity.x;
      this.holoRoot.rotation.y += this.rotationVelocity.y + 0.003; // idle spin
    }

    // Update Model Aktif
    if (this.currentModelType === 'lily') this.lily.update(time);
    if (this.currentModelType === 'dragon') this.dragon.update(time);
    if (this.currentModelType === 'butterfly') this.butterfly.update(time);
    if (this.currentModelType === 'bonsai') this.bonsai.update(time);

    this.boundingBox.update(time);
    this.particleVFX.update(delta);

    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animId !== null) cancelAnimationFrame(this.animId);
    if (this.onOrientationHandler) window.removeEventListener('deviceorientation', this.onOrientationHandler);
    window.removeEventListener('resize', this.onResize);
    this.renderer.dispose();
  }
}
