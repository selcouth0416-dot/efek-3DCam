import * as THREE from 'three';

export class ParticleVFX {
  public points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private count: number = 2500;
  private positions: Float32Array;
  private velocities: Float32Array;
  private originalPositions: Float32Array;
  private isDisintegrating: boolean = false;
  private progress: number = 0;

  constructor(count: number = 2500, color: number = 0x60a5fa) {
    this.count = count;
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count * 3);
    this.originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 0.2 + Math.random() * 0.8;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      this.positions[i * 3] = x;
      this.positions[i * 3 + 1] = y;
      this.positions[i * 3 + 2] = z;

      this.originalPositions[i * 3] = x;
      this.originalPositions[i * 3 + 1] = y;
      this.originalPositions[i * 3 + 2] = z;

      this.velocities[i * 3] = (Math.random() - 0.5) * 3;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 3 + 1.5;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 3;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

    this.material = new THREE.PointsMaterial({
      color: color,
      size: 0.045,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
  }

  public triggerDisintegrate(sourcePosition: THREE.Vector3, colorHex: number) {
    this.points.position.copy(sourcePosition);
    this.material.color.setHex(colorHex);
    this.isDisintegrating = true;
    this.progress = 0;
    this.points.visible = true;
    this.material.opacity = 0.95;

    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3] = this.originalPositions[i * 3];
      this.positions[i * 3 + 1] = this.originalPositions[i * 3 + 1];
      this.positions[i * 3 + 2] = this.originalPositions[i * 3 + 2];

      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5;
      this.velocities[i * 3] = Math.cos(angle) * speed;
      this.velocities[i * 3 + 1] = (Math.random() - 0.2) * speed * 1.5;
      this.velocities[i * 3 + 2] = Math.sin(angle) * speed;
    }
    this.geometry.attributes.position.needsUpdate = true;
  }

  public update(delta: number) {
    if (!this.isDisintegrating) return;

    this.progress += delta * 1.8;
    const pos = this.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.count; i++) {
      const idx = i * 3;
      pos[idx] += this.velocities[idx] * delta;
      pos[idx + 1] += this.velocities[idx + 1] * delta;
      pos[idx + 2] += this.velocities[idx + 2] * delta;

      const x = pos[idx];
      const z = pos[idx + 2];
      pos[idx] = x * Math.cos(delta * 2) - z * Math.sin(delta * 2);
      pos[idx + 2] = x * Math.sin(delta * 2) + z * Math.cos(delta * 2);
    }

    this.geometry.attributes.position.needsUpdate = true;

    if (this.progress > 0.5) {
      this.material.opacity = Math.max(0, 1 - (this.progress - 0.5) * 2);
    }

    if (this.progress >= 1.0) {
      this.isDisintegrating = false;
      this.points.visible = false;
      this.material.opacity = 0;
    }
  }

  public setParticleCount(newCount: number) {
    this.count = Math.min(newCount, this.positions.length / 3);
    this.geometry.setDrawRange(0, this.count);
  }
}
