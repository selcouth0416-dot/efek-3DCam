import * as THREE from 'three';

export class BonsaiModel {
  public group: THREE.Group;
  private foliageClouds: THREE.Mesh[] = [];
  private leafParticles: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.85,
      metalness: 0.1,
    });

    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // hijau zamrud lumut
      roughness: 0.7,
      metalness: 0.05,
      flatShading: true,
    });

    const potMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // pot keramik slate
      roughness: 0.3,
      metalness: 0.2,
    });

    // 1. Pot Keramik & Tanah
    const potGeo = new THREE.CylinderGeometry(0.55, 0.42, 0.22, 8);
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(0, -0.9, 0);
    this.group.add(pot);

    const soilGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.05, 8);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.set(0, -0.78, 0);
    this.group.add(soil);

    // 2. Batang Berkelok S
    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.8, 0),
      new THREE.Vector3(0.18, -0.4, 0.05),
      new THREE.Vector3(-0.15, 0.0, -0.05),
      new THREE.Vector3(0.1, 0.35, 0.02),
      new THREE.Vector3(0, 0.65, 0),
    ]);
    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 20, 0.14, 8, false);
    const trunk = new THREE.Mesh(trunkGeo, woodMat);
    this.group.add(trunk);

    // 3. Ranting
    const branches = [
      { start: [0.18, -0.3, 0.05], end: [0.65, -0.15, 0.2], radius: 0.06 },
      { start: [-0.15, 0.0, -0.05], end: [-0.75, 0.15, -0.15], radius: 0.06 },
      { start: [0.1, 0.35, 0.02], end: [0.55, 0.55, -0.1], radius: 0.05 },
      { start: [-0.05, 0.45, 0.0], end: [-0.5, 0.65, 0.2], radius: 0.045 },
      { start: [0, 0.65, 0], end: [0, 0.95, 0], radius: 0.04 },
    ];

    branches.forEach((b) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(...(b.start as [number, number, number])),
        new THREE.Vector3(
          (b.start[0] + b.end[0]) / 2 + (Math.random() - 0.5) * 0.1,
          (b.start[1] + b.end[1]) / 2 + 0.05,
          (b.start[2] + b.end[2]) / 2
        ),
        new THREE.Vector3(...(b.end as [number, number, number])),
      ]);
      const branchGeo = new THREE.TubeGeometry(curve, 10, b.radius, 6, false);
      const branchMesh = new THREE.Mesh(branchGeo, woodMat);
      this.group.add(branchMesh);
    });

    // 4. Awan Dedaunan Bonsai (Cloud Pruning)
    const foliageLocations = [
      { pos: [0.72, -0.1, 0.2], scale: [0.45, 0.22, 0.4] },
      { pos: [-0.8, 0.22, -0.15], scale: [0.55, 0.25, 0.45] },
      { pos: [0.6, 0.62, -0.1], scale: [0.48, 0.24, 0.42] },
      { pos: [-0.55, 0.72, 0.2], scale: [0.46, 0.22, 0.38] },
      { pos: [0, 1.05, 0], scale: [0.65, 0.32, 0.55] },
      { pos: [0.25, 0.95, 0.2], scale: [0.38, 0.2, 0.35] },
      { pos: [-0.25, 0.92, -0.2], scale: [0.4, 0.2, 0.35] },
    ];

    foliageLocations.forEach((f) => {
      const geo = new THREE.DodecahedronGeometry(1.0, 1);
      const mesh = new THREE.Mesh(geo, foliageMat);
      mesh.position.set(f.pos[0], f.pos[1], f.pos[2]);
      mesh.scale.set(f.scale[0], f.scale[1], f.scale[2]);
      this.foliageClouds.push(mesh);
      this.group.add(mesh);
    });

    // 5. Guguran Daun Melayang
    const leafCount = 80;
    const leafGeo = new THREE.BufferGeometry();
    const leafPos = new Float32Array(leafCount * 3);
    for (let i = 0; i < leafCount; i++) {
      leafPos[i * 3] = (Math.random() - 0.5) * 1.6;
      leafPos[i * 3 + 1] = -0.5 + Math.random() * 1.6;
      leafPos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
    }
    leafGeo.setAttribute('position', new THREE.BufferAttribute(leafPos, 3));
    const leafMat = new THREE.PointsMaterial({
      color: 0x86efac,
      size: 0.04,
      transparent: true,
      opacity: 0.8,
    });
    this.leafParticles = new THREE.Points(leafGeo, leafMat);
    this.group.add(this.leafParticles);

    this.group.position.y = 0.1;
  }

  public update(time: number) {
    this.foliageClouds.forEach((cloud, i) => {
      cloud.rotation.y = Math.sin(time * 1.2 + i) * 0.08;
      cloud.position.y += Math.sin(time * 2 + i) * 0.0008;
    });

    this.group.rotation.z = Math.sin(time * 0.8) * 0.02;

    const pos = this.leafParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] -= 0.004;
      pos[i * 3] += Math.sin(time * 2 + i) * 0.002;
      if (pos[i * 3 + 1] < -0.8) {
        pos[i * 3 + 1] = 1.1;
        pos[i * 3] = (Math.random() - 0.5) * 1.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
      }
    }
    this.leafParticles.geometry.attributes.position.needsUpdate = true;
  }
}
