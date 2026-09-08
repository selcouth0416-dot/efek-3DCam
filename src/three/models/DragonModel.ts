import * as THREE from 'three';

export class DragonModel {
  public group: THREE.Group;
  private leftWing: THREE.Group;
  private rightWing: THREE.Group;
  private leftWingMembrane: THREE.Mesh;
  private rightWingMembrane: THREE.Mesh;
  private tailSegments: THREE.Mesh[] = [];
  private neck: THREE.Group;
  private head: THREE.Group;
  private jaw: THREE.Mesh;
  private fireParticles: THREE.Points;
  private leftEye: THREE.Mesh;
  private rightEye: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // Material sisik merah carmine
    const dragonMat = new THREE.MeshStandardMaterial({
      color: 0xa81111,
      roughness: 0.35,
      metalness: 0.25,
    });

    const underbellyMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // sisik perut emas amber
      roughness: 0.45,
      metalness: 0.15,
    });

    const wingMembraneMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // membran sayap merah bara
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.1,
      transparent: true,
      opacity: 0.94,
    });

    const boneMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.5,
      metalness: 0.2,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.85,
      roughness: 0.2,
    });

    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0xfde047, // mata kuning menyala
    });

    // 1. Torso Aerodinamis
    const torsoGeo = new THREE.ConeGeometry(0.34, 1.2, 12);
    const torso = new THREE.Mesh(torsoGeo, dragonMat);
    torso.rotation.x = Math.PI / 2.3;
    this.group.add(torso);

    // Sisik perut
    for (let i = 0; i < 6; i++) {
      const ribGeo = new THREE.CylinderGeometry(0.26 - i * 0.02, 0.28 - i * 0.02, 0.1, 8, 1, false, 0, Math.PI);
      const rib = new THREE.Mesh(ribGeo, underbellyMat);
      rib.position.set(0, -0.15 - i * 0.02, -0.4 + i * 0.18);
      rib.rotation.x = Math.PI / 2.3;
      rib.rotation.y = Math.PI;
      this.group.add(rib);
    }

    // Duri punggung emas
    for (let i = 0; i < 7; i++) {
      const spikeGeo = new THREE.ConeGeometry(0.04, 0.22, 4);
      const spike = new THREE.Mesh(spikeGeo, goldMat);
      spike.position.set(0, 0.24 - i * 0.02, -0.5 + i * 0.18);
      spike.rotation.x = -0.35;
      this.group.add(spike);
    }

    // 2. Leher & Kepala Bertanduk
    this.neck = new THREE.Group();
    this.neck.position.set(0, 0.16, 0.45);

    const neckGeo = new THREE.CylinderGeometry(0.12, 0.22, 0.6, 8);
    const neckMesh = new THREE.Mesh(neckGeo, dragonMat);
    neckMesh.position.set(0, 0.25, 0.15);
    neckMesh.rotation.x = 0.55;
    this.neck.add(neckMesh);

    // Grup Kepala
    this.head = new THREE.Group();
    this.head.position.set(0, 0.52, 0.42);

    const headGeo = new THREE.ConeGeometry(0.18, 0.54, 6);
    const headMesh = new THREE.Mesh(headGeo, dragonMat);
    headMesh.rotation.x = 1.35;
    this.head.add(headMesh);

    // Rahang bawah terbuka saat menderu
    const jawGeo = new THREE.ConeGeometry(0.14, 0.45, 6);
    this.jaw = new THREE.Mesh(jawGeo, dragonMat);
    this.jaw.position.set(0, -0.1, 0.05);
    this.jaw.rotation.x = 1.25;
    this.head.add(this.jaw);

    // Tanduk Emas Melengkung
    const hornGeo = new THREE.ConeGeometry(0.045, 0.45, 6);
    const leftHorn = new THREE.Mesh(hornGeo, goldMat);
    leftHorn.position.set(-0.13, 0.18, -0.05);
    leftHorn.rotation.set(-0.55, 0, -0.4);
    this.head.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, goldMat);
    rightHorn.position.set(0.13, 0.18, -0.05);
    rightHorn.rotation.set(-0.55, 0, 0.4);
    this.head.add(rightHorn);

    // Mata Menyala
    const eyeGeo = new THREE.SphereGeometry(0.042, 8, 8);
    this.leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.leftEye.position.set(-0.11, 0.06, 0.15);
    this.head.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    this.rightEye.position.set(0.11, 0.06, 0.15);
    this.head.add(this.rightEye);

    this.neck.add(this.head);
    this.group.add(this.neck);

    // 3. Ekor Beruas Cambuk
    const tailRoot = new THREE.Group();
    tailRoot.position.set(0, 0.08, -0.55);

    const segmentCount = 6;
    let prevParent: THREE.Object3D = tailRoot;
    for (let i = 0; i < segmentCount; i++) {
      const segGroup = new THREE.Group();
      segGroup.position.set(0, 0, -0.16);

      const rTop = 0.11 * (1 - (i / segmentCount) * 0.7);
      const rBot = 0.13 * (1 - (i / segmentCount) * 0.6);
      const segGeo = new THREE.CylinderGeometry(rTop, rBot, 0.18, 6);
      const segMesh = new THREE.Mesh(segGeo, dragonMat);
      segMesh.rotation.x = Math.PI / 2;
      segGroup.add(segMesh);

      this.tailSegments.push(segMesh);
      prevParent.add(segGroup);
      prevParent = segGroup;
    }

    const spadeGeo = new THREE.ConeGeometry(0.14, 0.32, 4);
    const spade = new THREE.Mesh(spadeGeo, goldMat);
    spade.rotation.x = -Math.PI / 2;
    spade.position.set(0, 0, -0.2);
    prevParent.add(spade);
    this.group.add(tailRoot);

    // 4. Sayap Kelelawar Berengsel
    const leftWingData = this.createArticulatedWing(false, boneMat, wingMembraneMat, goldMat);
    this.leftWing = leftWingData.group;
    this.leftWingMembrane = leftWingData.membrane;
    this.leftWing.position.set(-0.25, 0.22, 0.1);
    this.group.add(this.leftWing);

    const rightWingData = this.createArticulatedWing(true, boneMat, wingMembraneMat, goldMat);
    this.rightWing = rightWingData.group;
    this.rightWingMembrane = rightWingData.membrane;
    this.rightWing.position.set(0.25, 0.22, 0.1);
    this.group.add(this.rightWing);

    // 5. Partikel Bara Api Oranye
    const fireCount = 150;
    const fireGeo = new THREE.BufferGeometry();
    const firePos = new Float32Array(fireCount * 3);
    for (let i = 0; i < fireCount; i++) {
      firePos[i * 3] = (Math.random() - 0.5) * 0.9;
      firePos[i * 3 + 1] = (Math.random() - 0.3) * 1.4;
      firePos[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
    }
    fireGeo.setAttribute('position', new THREE.BufferAttribute(firePos, 3));
    const fireMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.055,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.fireParticles = new THREE.Points(fireGeo, fireMat);
    this.group.add(this.fireParticles);

    this.group.scale.set(1.15, 1.15, 1.15);
  }

  private createArticulatedWing(
    isRight: boolean,
    boneMat: THREE.Material,
    membraneMat: THREE.Material,
    clawMat: THREE.Material
  ) {
    const group = new THREE.Group();
    const sign = isRight ? 1 : -1;

    // Tulang Lengan
    const armGeo = new THREE.CylinderGeometry(0.045, 0.065, 0.65, 6);
    const arm = new THREE.Mesh(armGeo, boneMat);
    arm.position.set(sign * 0.32, 0.22, 0);
    arm.rotation.z = sign * -0.7;
    group.add(arm);

    // Jari-jari Sayap
    const finger1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.95, 6), boneMat);
    finger1.position.set(sign * 0.72, 0.55, 0.1);
    finger1.rotation.z = sign * -0.38;
    group.add(finger1);

    const finger2 = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.032, 0.85, 6), boneMat);
    finger2.position.set(sign * 0.95, 0.38, -0.15);
    finger2.rotation.z = sign * -0.88;
    group.add(finger2);

    const finger3 = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.026, 0.75, 6), boneMat);
    finger3.position.set(sign * 0.88, 0.12, -0.38);
    finger3.rotation.z = sign * -1.28;
    group.add(finger3);

    // Cakar sayap
    const claw = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), clawMat);
    claw.position.set(sign * 0.58, 0.52, 0.02);
    claw.rotation.z = sign * 0.85;
    group.add(claw);

    // Bentuk Membran Sayap
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(sign * 0.65, 0.55);
    shape.lineTo(sign * 1.05, 0.88);
    shape.quadraticCurveTo(sign * 1.0, 0.48, sign * 1.25, 0.32);
    shape.quadraticCurveTo(sign * 1.08, 0.05, sign * 1.15, -0.18);
    shape.quadraticCurveTo(sign * 0.65, -0.05, 0, -0.22);
    shape.closePath();

    const membraneGeo = new THREE.ShapeGeometry(shape, 12);
    const membrane = new THREE.Mesh(membraneGeo, membraneMat);
    group.add(membrane);

    return { group, membrane };
  }

  public update(time: number) {
    // Kepakan sayap dinamis
    const flapCycle = Math.sin(time * 5.5);
    const flapPhase = Math.cos(time * 5.5);

    this.leftWing.rotation.z = -flapCycle * 0.65 + 0.2;
    this.leftWing.rotation.y = flapPhase * 0.35;
    this.leftWing.rotation.x = Math.sin(time * 5.5 + 0.5) * 0.18;

    this.rightWing.rotation.z = flapCycle * 0.65 - 0.2;
    this.rightWing.rotation.y = -flapPhase * 0.35;
    this.rightWing.rotation.x = Math.sin(time * 5.5 + 0.5) * 0.18;

    // Gerakan kepala & rahang
    this.neck.rotation.x = Math.sin(time * 2.5) * 0.12;
    this.neck.rotation.y = Math.cos(time * 2.0) * 0.1;
    this.jaw.rotation.x = 1.25 + Math.max(0, Math.sin(time * 3.5)) * 0.25;

    // Kerlip mata
    const eyeIntensity = 0.85 + Math.sin(time * 12) * 0.15;
    (this.leftEye.material as THREE.MeshBasicMaterial).color.setRGB(1.0 * eyeIntensity, 0.88 * eyeIntensity, 0.28);
    (this.rightEye.material as THREE.MeshBasicMaterial).color.setRGB(1.0 * eyeIntensity, 0.88 * eyeIntensity, 0.28);

    // Ekor mencambuk
    this.tailSegments.forEach((seg, i) => {
      seg.rotation.y = Math.sin(time * 3.5 - i * 0.5) * 0.18;
      seg.rotation.x = Math.cos(time * 2.5 - i * 0.4) * 0.08;
    });

    // Terbang mengambang
    this.group.position.y = Math.sin(time * 2.8) * 0.14;
    this.group.rotation.y = Math.sin(time * 1.4) * 0.22;
    this.group.rotation.z = -Math.cos(time * 1.4) * 0.08;

    // Semburan partikel api
    const pos = this.fireParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += 0.018;
      if (pos[i * 3 + 1] > 1.3) {
        pos[i * 3 + 1] = -0.15;
        pos[i * 3] = (Math.random() - 0.5) * 0.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
      }
    }
    this.fireParticles.geometry.attributes.position.needsUpdate = true;
  }
}
