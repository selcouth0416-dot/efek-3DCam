import * as THREE from 'three';

export class LilyModel {
  public group: THREE.Group;
  private innerPetals: THREE.Mesh[] = [];
  private outerPetals: THREE.Mesh[] = [];
  private allPetals: THREE.Mesh[] = [];
  private stamens: { group: THREE.Group; anther: THREE.Mesh; baseAngle: number }[] = [];
  private pistilGroup: THREE.Group;
  private stemGroup: THREE.Group;
  private projectionRings: THREE.Mesh[] = [];
  private holoParticles: THREE.Points;
  private petalMaterials: THREE.Material[] = [];
  private wireframes: THREE.LineSegments[] = [];

  constructor() {
    this.group = new THREE.Group();

    // 1. Tekstur Hologram Gradasi Optik & Garis Pendaran Laser
    const holoCanvas = document.createElement('canvas');
    holoCanvas.width = 512;
    holoCanvas.height = 1024;
    const ctx = holoCanvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 1024, 0, 0);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.95)');   // Cyan Neon Base
    grad.addColorStop(0.2, 'rgba(56, 189, 248, 0.9)');  // Sky Blue
    grad.addColorStop(0.45, 'rgba(168, 85, 247, 0.85)');// Electric Violet
    grad.addColorStop(0.7, 'rgba(236, 72, 153, 0.9)');  // Hot Magenta
    grad.addColorStop(0.9, 'rgba(251, 113, 133, 0.95)');// Radiant Coral
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 1.0)');  // Laser White Rim

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Garis urat kelopak holografik halus
    ctx.lineWidth = 2;
    for (let i = 0; i < 48; i++) {
      const y = 150 + i * 18;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + (i % 4) * 0.08})`;
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(140, y - 20, 20, y + 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(372, y - 20, 492, y + 40);
      ctx.stroke();
    }

    // Garis-garis scanline hologram
    for (let y = 0; y < 1024; y += 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(0, y, 512, 1);
    }

    const holoTexture = new THREE.CanvasTexture(holoCanvas);
    holoTexture.wrapS = THREE.ClampToEdgeWrapping;
    holoTexture.wrapT = THREE.ClampToEdgeWrapping;

    // 2. Material Hologram Transparan Bercahaya Sejati
    const petalMat = new THREE.MeshPhysicalMaterial({
      map: holoTexture,
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      emissiveMap: holoTexture,
      transparent: true,
      opacity: 0.88,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.45,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // Efek Cahaya Hologram Asli
    });
    this.petalMaterials.push(petalMat);

    // 3. Bentuk Kelopak Lentik Melengkung Alami
    const createNaturalPetalGeometry = (widthScale: number, curveIntensity: number) => {
      const geom = new THREE.PlaneGeometry(0.85 * widthScale, 2.4, 28, 52);
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const normY = (y + 1.2) / 2.4;

        const widthCurve = Math.sin(normY * Math.PI) * (1 - normY * 0.25);
        const newX = x * (0.18 + widthCurve * 1.05);
        pos.setX(i, newX);

        // Lengkungan lentik alami ke belakang
        const arch = -Math.sin(normY * Math.PI * 0.82) * (0.48 * curveIntensity) -
          (normY > 0.55 ? Math.pow(normY - 0.55, 2) * (0.75 * curveIntensity) : 0);

        // Cekungan kelopak (U-shape)
        const cup = Math.pow(Math.abs(newX), 1.5) * 0.45 * (1 - normY * 0.4);

        // Ombak halus di tepi kelopak
        const ruffle = Math.sin(normY * 16) * 0.028 * Math.abs(newX);

        pos.setZ(i, arch + cup + ruffle);
      }
      geom.computeVertexNormals();
      return geom;
    };

    const innerGeo = createNaturalPetalGeometry(1.05, 1.05);
    const outerGeo = createNaturalPetalGeometry(0.92, 1.22);

    const wireMat = new THREE.LineBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
    });

    // 4. Susun 6 Kelopak Bunga (3 Dalam + 3 Luar Selang-Seling)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const petal = new THREE.Mesh(innerGeo, petalMat);
      petal.rotation.y = angle;
      petal.rotation.x = 1.05;
      this.innerPetals.push(petal);
      this.allPetals.push(petal);
      this.group.add(petal);

      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(innerGeo), wireMat);
      wire.rotation.copy(petal.rotation);
      this.wireframes.push(wire);
      this.group.add(wire);
    }

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
      const petal = new THREE.Mesh(outerGeo, petalMat);
      petal.position.set(0, -0.05, 0);
      petal.rotation.y = angle;
      petal.rotation.x = 1.24;
      this.outerPetals.push(petal);
      this.allPetals.push(petal);
      this.group.add(petal);

      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(outerGeo), wireMat);
      wire.position.copy(petal.position);
      wire.rotation.copy(petal.rotation);
      this.wireframes.push(wire);
      this.group.add(wire);
    }

    // 5. Putik Tengah (Pistil) Bercahaya Hijau Mint
    this.pistilGroup = new THREE.Group();
    const pistilCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0),
      new THREE.Vector3(0.02, 0.45, 0.03),
      new THREE.Vector3(0, 1.05, 0),
      new THREE.Vector3(0, 1.42, 0),
    ]);
    const pistilGeo = new THREE.TubeGeometry(pistilCurve, 16, 0.032, 8, false);
    const pistilMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });
    this.pistilGroup.add(new THREE.Mesh(pistilGeo, pistilMat));

    const stigmaMat = new THREE.MeshBasicMaterial({
      color: 0xa7f3d0,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    for (let s = 0; s < 3; s++) {
      const sAngle = (s / 3) * Math.PI * 2;
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), stigmaMat);
      bulb.position.set(Math.cos(sAngle) * 0.035, 1.44, Math.sin(sAngle) * 0.035);
      this.pistilGroup.add(bulb);
    }
    this.group.add(this.pistilGroup);

    // 6. 6 Benang Sari (Stamens) dengan Serbuk Emas Hologram
    const filamentMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const antherMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 6; i++) {
      const baseAngle = (i / 6) * Math.PI * 2 + 0.3;
      const stamenGroup = new THREE.Group();
      const spread = 0.48;
      const endX = Math.cos(baseAngle) * spread;
      const endZ = Math.sin(baseAngle) * spread;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.15, 0),
        new THREE.Vector3(endX * 0.35, 0.5, endZ * 0.35),
        new THREE.Vector3(endX, 1.22, endZ),
      ]);

      const filament = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.02, 6, false), filamentMat);
      stamenGroup.add(filament);

      const anther = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.22, 8), antherMat);
      anther.position.set(endX, 1.22, endZ);
      anther.rotation.z = Math.PI / 2.2;
      anther.rotation.y = baseAngle;
      stamenGroup.add(anther);

      this.stamens.push({ group: stamenGroup, anther, baseAngle });
      this.group.add(stamenGroup);
    }

    // 7. Batang Hijau Hologram
    this.stemGroup = new THREE.Group();
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.02, -0.5, 0.02),
      new THREE.Vector3(-0.03, -1.1, -0.02),
    ]);
    const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.05, 8, false);
    const stemMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    this.stemGroup.add(new THREE.Mesh(stemGeo, stemMat));
    this.group.add(this.stemGroup);

    // 8. Cincin Proyeksi Hologram (Emitter Rings) di Bagian Bawah
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    for (let r = 0; r < 3; r++) {
      const ringGeo = new THREE.RingGeometry(0.35 + r * 0.25, 0.38 + r * 0.25, 32);
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -1.15;
      this.projectionRings.push(ringMesh);
      this.group.add(ringMesh);
    }

    // 9. Partikel Cahaya Energi Mengambang
    const pCount = 350;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const radius = 0.15 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const height = -1.0 + Math.random() * 2.5;

      pPos[i * 3] = Math.cos(theta) * radius;
      pPos[i * 3 + 1] = height;
      pPos[i * 3 + 2] = Math.sin(theta) * radius;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.holoParticles = new THREE.Points(pGeo, pMat);
    this.group.add(this.holoParticles);
  }

  public update(time: number) {
    // Animasi Mekar & Bernafas Alami
    const breath = Math.sin(time * 1.8) * 0.055;
    const microSway = Math.sin(time * 1.2) * 0.025;

    for (let i = 0; i < this.innerPetals.length; i++) {
      this.innerPetals[i].rotation.x = 1.05 + breath;
      this.innerPetals[i].rotation.z = Math.sin(time * 2.2 + i) * 0.02;
    }
    for (let i = 0; i < this.outerPetals.length; i++) {
      this.outerPetals[i].rotation.x = 1.24 + breath * 1.2;
      this.outerPetals[i].rotation.z = Math.sin(time * 2.0 + i) * 0.025;
    }

    for (let i = 0; i < this.allPetals.length; i++) {
      if (this.wireframes[i]) {
        this.wireframes[i].rotation.copy(this.allPetals[i].rotation);
      }
    }

    // Ayunan benang sari
    for (let i = 0; i < this.stamens.length; i++) {
      const st = this.stamens[i];
      const tremor = Math.sin(time * 3.5 + i * 1.2) * 0.035;
      st.anther.rotation.x = tremor;
      st.group.rotation.y = Math.sin(time * 1.4 + i) * 0.02;
    }

    this.stemGroup.rotation.z = microSway * 0.5;
    this.pistilGroup.rotation.z = microSway * 0.8;

    // Putaran cincin proyektor hologram
    for (let r = 0; r < this.projectionRings.length; r++) {
      const ring = this.projectionRings[r];
      ring.rotation.z = time * (0.35 + r * 0.2) * (r % 2 === 0 ? 1 : -1);
      const scale = 1.0 + Math.sin(time * 2.5 + r) * 0.06;
      ring.scale.set(scale, scale, scale);
    }

    // Partikel cahaya melayang naik
    const pos = this.holoParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += 0.008;
      if (pos[i * 3 + 1] > 1.6) {
        pos[i * 3 + 1] = -1.0;
      }
    }
    this.holoParticles.geometry.attributes.position.needsUpdate = true;
  }
}
