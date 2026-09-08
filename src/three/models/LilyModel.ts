import * as THREE from 'three';

export class LilyModel {
  public group: THREE.Group;
  private innerPetals: THREE.Mesh[] = [];
  private outerPetals: THREE.Mesh[] = [];
  private stamens: { filament: THREE.Mesh; anther: THREE.Mesh; group: THREE.Group; baseAngle: number }[] = [];
  private pistilGroup: THREE.Group;
  private stemGroup: THREE.Group;
  private pollenParticles: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    // 1. Kanvas Tekstur Resolusi Tinggi Kelopak Stargazer Lily
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Gradasi botanis
    const grad = ctx.createLinearGradient(0, 1024, 0, 0);
    grad.addColorStop(0, '#84cc16'); // hijau tenggorokan
    grad.addColorStop(0.12, '#bef264');
    grad.addColorStop(0.22, '#ffffff'); // halo putih
    grad.addColorStop(0.38, '#e11d48'); // magenta
    grad.addColorStop(0.62, '#9f1239'); // crimson tua
    grad.addColorStop(0.85, '#fb7185'); // coral pink
    grad.addColorStop(1.0, '#ffffff');  // tepi kelopak putih

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Vena lateral
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 40; i++) {
      const y = 200 + i * 18;
      ctx.strokeStyle = `rgba(136, 19, 55, ${0.15 + (i % 3) * 0.08})`;
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(160, y - 15, 40, y + 30);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(352, y - 15, 472, y + 30);
      ctx.stroke();
    }

    // Bintik beludru merah ruby (freckles)
    ctx.fillStyle = '#4c0519';
    for (let i = 0; i < 260; i++) {
      const rx = 140 + Math.random() * 232;
      const ry = 300 + Math.random() * 520;
      if (Math.abs(rx - 256) < 120) {
        ctx.beginPath();
        ctx.arc(rx, ry, 1.5 + Math.random() * 2.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const petalTexture = new THREE.CanvasTexture(canvas);
    const petalMat = new THREE.MeshStandardMaterial({
      map: petalTexture,
      side: THREE.DoubleSide,
      roughness: 0.32,
      metalness: 0.08,
    });

    // 2. Geometri Kelopak Kelengkungan Ganda (Double-Curvature)
    const createPetalGeometry = (widthScale: number, curveIntensity: number) => {
      const geom = new THREE.PlaneGeometry(0.85 * widthScale, 2.5, 24, 48);
      const pos = geom.attributes.position;

      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const ny = (y + 1.25) / 2.5;

        const widthFactor = Math.sin(ny * Math.PI) * (1 - ny * 0.3);
        const newX = x * (0.25 + widthFactor * 0.95);
        pos.setX(i, newX);

        // Lekukan keluar melengkung anggun
        const longitudinal =
          -Math.sin(ny * Math.PI * 0.85) * (0.45 * curveIntensity) -
          (ny > 0.6 ? Math.pow(ny - 0.6, 2) * (0.7 * curveIntensity) : 0);
        const cupping = Math.pow(Math.abs(newX), 1.6) * 0.55 * (1 - ny * 0.5);
        const ripple = Math.sin(ny * 18) * 0.035 * Math.abs(newX);

        pos.setZ(i, longitudinal + cupping + ripple);
      }
      geom.computeVertexNormals();
      return geom;
    };

    const innerGeo = createPetalGeometry(1.08, 1.0);
    const outerGeo = createPetalGeometry(0.92, 1.15);

    // 3 Kelopak Dalam
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(innerGeo, petalMat);
      p.rotation.y = (i / 3) * Math.PI * 2;
      p.rotation.x = 1.02;
      this.innerPetals.push(p);
      this.group.add(p);
    }

    // 3 Kelopak Luar
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Mesh(outerGeo, petalMat);
      p.rotation.y = (i / 3) * Math.PI * 2 + Math.PI / 3;
      p.rotation.x = 1.18;
      this.outerPetals.push(p);
      this.group.add(p);
    }

    // 3. Putik & Stigma
    this.pistilGroup = new THREE.Group();
    const pistilCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.2, 0),
      new THREE.Vector3(0.04, 0.5, 0.05),
      new THREE.Vector3(0.02, 1.1, 0.02),
      new THREE.Vector3(0, 1.45, 0),
    ]);
    this.pistilGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(pistilCurve, 16, 0.038, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.35 })
      )
    );

    const stigmaMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 });
    for (let s = 0; s < 3; s++) {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 8), stigmaMat);
      const lobeAngle = (s / 3) * Math.PI * 2;
      lobe.position.set(Math.cos(lobeAngle) * 0.04, 1.46, Math.sin(lobeAngle) * 0.04);
      lobe.scale.set(1.0, 0.7, 1.0);
      this.pistilGroup.add(lobe);
    }
    this.group.add(this.pistilGroup);

    // 4. Benang Sari & Anther Serbuk Emas
    const filamentMat = new THREE.MeshStandardMaterial({ color: 0xa7f3d0, roughness: 0.4 });
    const antherMat = new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0x78350f, roughness: 0.7 });
    const antherGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.26, 8);

    for (let i = 0; i < 6; i++) {
      const baseAngle = (i / 6) * Math.PI * 2 + 0.3;
      const stamenGroup = new THREE.Group();
      const endX = Math.cos(baseAngle) * 0.52;
      const endZ = Math.sin(baseAngle) * 0.52;

      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.2, 0),
        new THREE.Vector3(endX * 0.4, 0.55, endZ * 0.4),
        new THREE.Vector3(endX, 1.25, endZ),
      ]);
      const filament = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.024, 6, false), filamentMat);
      stamenGroup.add(filament);

      const anther = new THREE.Mesh(antherGeo, antherMat);
      anther.position.set(endX, 1.25, endZ);
      anther.rotation.z = Math.PI / 2.2;
      anther.rotation.y = baseAngle;
      stamenGroup.add(anther);

      this.stamens.push({ filament, anther, group: stamenGroup, baseAngle });
      this.group.add(stamenGroup);
    }

    // 5. Batang Hijau
    this.stemGroup = new THREE.Group();
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.03, -0.6, 0.02),
      new THREE.Vector3(-0.04, -1.2, -0.02),
    ]);
    this.stemGroup.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(stemCurve, 16, 0.065, 8, false),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.5 })
      )
    );
    this.group.add(this.stemGroup);

    // 6. Serbuk Sari Bercahaya
    const pollenCount = 120;
    const pollenGeo = new THREE.BufferGeometry();
    const pollenPos = new Float32Array(pollenCount * 3);
    for (let i = 0; i < pollenCount; i++) {
      pollenPos[i * 3] = (Math.random() - 0.5) * 1.1;
      pollenPos[i * 3 + 1] = 0.3 + Math.random() * 1.3;
      pollenPos[i * 3 + 2] = (Math.random() - 0.5) * 1.1;
    }
    pollenGeo.setAttribute('position', new THREE.BufferAttribute(pollenPos, 3));
    this.pollenParticles = new THREE.Points(
      pollenGeo,
      new THREE.PointsMaterial({
        color: 0xfde047,
        size: 0.042,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      })
    );
    this.group.add(this.pollenParticles);
    this.group.position.y = -0.15;
  }

  public update(time: number) {
    // Kelopak bernapas mekar
    this.innerPetals.forEach((p, idx) => {
      p.rotation.x = 1.02 + Math.sin(time * 1.3 + idx * 0.4) * 0.06;
    });
    this.outerPetals.forEach((p, idx) => {
      p.rotation.x = 1.18 + Math.sin(time * 1.4 + idx * 0.5) * 0.07;
    });

    // Anther bergetar mikro
    this.stamens.forEach((s, idx) => {
      s.anther.rotation.x = Math.sin(time * 6 + idx * 1.2) * 0.04;
      s.anther.rotation.z = Math.PI / 2.2 + Math.cos(time * 4 + idx) * 0.05;
    });

    // Batang bergoyang lembut
    this.group.rotation.y = Math.sin(time * 0.5) * 0.15;

    // Partikel serbuk sari naik ke atas
    const pos = this.pollenParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += 0.0035;
      if (pos[i * 3 + 1] > 1.6) {
        pos[i * 3 + 1] = 0.3;
        pos[i * 3] = (Math.random() - 0.5) * 0.6;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      }
    }
    this.pollenParticles.geometry.attributes.position.needsUpdate = true;
  }
}
