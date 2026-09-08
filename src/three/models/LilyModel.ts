import * as THREE from 'three';

export class LilyModel {
  public group: THREE.Group;
  private flowerGroups: THREE.Group[] = [];
  private leaves: THREE.Mesh[] = [];
  private pollenParticles: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    // 1. Tekstur Kelopak Bunga Stargazer Lily
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 1024, 0, 0);
    grad.addColorStop(0, '#84cc16');    // Hijau pangkal
    grad.addColorStop(0.1, '#d9f99d');  // Kuning muda
    grad.addColorStop(0.2, '#ffffff');  // Pita putih
    grad.addColorStop(0.35, '#ec4899'); // Hot pink cerah
    grad.addColorStop(0.58, '#be123c'); // Merah ruby
    grad.addColorStop(0.82, '#fb7185'); // Merah muda
    grad.addColorStop(1.0, '#ffffff');  // Pinggiran putih

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 1024);

    // Urat halus kelopak
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 40; i++) {
      const y = 160 + i * 20;
      ctx.strokeStyle = `rgba(159, 18, 57, ${0.15 + (i % 3) * 0.06})`;
      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(140, y - 20, 30, y + 40);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(256, y);
      ctx.quadraticCurveTo(372, y - 20, 482, y + 40);
      ctx.stroke();
    }

    // Bintik-bintik merah gelap Stargazer
    ctx.fillStyle = '#4c0519';
    for (let i = 0; i < 280; i++) {
      const rx = 160 + Math.random() * 192;
      const ry = 280 + Math.random() * 500;
      const radius = 1.2 + Math.random() * 2.2;
      ctx.beginPath();
      ctx.arc(rx, ry, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const lilyTexture = new THREE.CanvasTexture(canvas);
    lilyTexture.wrapS = THREE.ClampToEdgeWrapping;
    lilyTexture.wrapT = THREE.ClampToEdgeWrapping;

    const petalMaterial = new THREE.MeshStandardMaterial({
      map: lilyTexture,
      roughness: 0.35,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    // 2. Geometri Kelopak Melengkung Mekar Alami
    const createLilyPetal = (length: number, maxWidth: number, reflexAngle: number) => {
      const widthSegments = 20;
      const lengthSegments = 32;
      const geom = new THREE.BufferGeometry();

      const vertices: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let j = 0; j <= lengthSegments; j++) {
        const v = j / lengthSegments;
        const curRadius = v * length;
        const arch = Math.sin(v * Math.PI * 0.8) * 0.38 - Math.pow(v, 2.2) * (0.65 * reflexAngle);
        const width = Math.sin(v * Math.PI) * (maxWidth * (1.1 - v * 0.25));

        for (let i = 0; i <= widthSegments; i++) {
          const u = i / widthSegments;
          const normU = (u - 0.5) * 2;
          const x = normU * (width * 0.5);
          const cup = (1 - normU * normU) * (0.12 * Math.sin(v * Math.PI));
          const ruffle = Math.sin(v * 20) * 0.02 * Math.abs(normU);

          vertices.push(x, arch + cup + ruffle, curRadius);
          uvs.push(u, 1 - v);
        }
      }

      for (let j = 0; j < lengthSegments; j++) {
        for (let i = 0; i < widthSegments; i++) {
          const a = j * (widthSegments + 1) + i;
          const b = (j + 1) * (widthSegments + 1) + i;
          const c = (j + 1) * (widthSegments + 1) + (i + 1);
          const d = j * (widthSegments + 1) + (i + 1);

          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      return geom;
    };

    const innerPetalGeo = createLilyPetal(1.4, 0.72, 1.15);
    const outerPetalGeo = createLilyPetal(1.5, 0.65, 1.35);

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.5,
      metalness: 0.05,
    });
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0xd9f99d,
      roughness: 0.4,
    });
    const antherMat = new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.7,
      emissive: 0x7c2d12,
      emissiveIntensity: 0.2,
    });

    const buildOpenLilyBloom = (scale: number): THREE.Group => {
      const flowerGroup = new THREE.Group();

      const receptacle = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.15, 12), stemMat);
      receptacle.position.set(0, -0.05, 0);
      flowerGroup.add(receptacle);

      // 3 Kelopak Dalam Mekar
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const petal = new THREE.Mesh(innerPetalGeo, petalMaterial);
        petal.rotation.y = angle;
        petal.rotation.x = -0.32;
        flowerGroup.add(petal);
      }

      // 3 Kelopak Luar Mekar Lebih Lebar
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
        const petal = new THREE.Mesh(outerPetalGeo, petalMaterial);
        petal.rotation.y = angle;
        petal.rotation.x = -0.42;
        flowerGroup.add(petal);
      }

      // Benang Sari Rapi di Dalam Bunga (Tidak Menusuk Keluar)
      for (let s = 0; s < 6; s++) {
        const sAngle = (s / 6) * Math.PI * 2 + 0.5;
        const reach = 0.28;
        const endX = Math.cos(sAngle) * reach;
        const endZ = Math.sin(sAngle) * reach;

        const fCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(endX * 0.4, 0.22, endZ * 0.4),
          new THREE.Vector3(endX, 0.42, endZ),
        ]);
        const filament = new THREE.Mesh(new THREE.TubeGeometry(fCurve, 10, 0.012, 6, false), filamentMat);
        flowerGroup.add(filament);

        const anther = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.11, 8), antherMat);
        anther.position.set(endX, 0.43, endZ);
        anther.rotation.z = Math.PI / 2;
        anther.rotation.y = sAngle;
        flowerGroup.add(anther);
      }

      // Putik Tengah
      const pistilCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.01, 0.25, 0.01),
        new THREE.Vector3(0, 0.48, 0),
      ]);
      const pistil = new THREE.Mesh(new THREE.TubeGeometry(pistilCurve, 10, 0.02, 6, false), filamentMat);
      flowerGroup.add(pistil);

      const stigma = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), stemMat);
      stigma.position.set(0, 0.49, 0);
      flowerGroup.add(stigma);

      flowerGroup.scale.set(scale, scale, scale);
      return flowerGroup;
    };

    // Bunga Utama Menghadap ke Depan
    const mainFlower = buildOpenLilyBloom(0.85);
    mainFlower.position.set(0.15, 0.05, 0.2);
    mainFlower.rotation.set(1.2, 0.25, -0.3);
    this.flowerGroups.push(mainFlower);
    this.group.add(mainFlower);

    // Bunga Kedua Menghadap Kiri
    const leftFlower = buildOpenLilyBloom(0.72);
    leftFlower.position.set(-0.35, 0.35, 0.05);
    leftFlower.rotation.set(1.0, -0.85, 0.4);
    this.flowerGroups.push(leftFlower);
    this.group.add(leftFlower);

    // Kuntum Atas
    const topFlower = buildOpenLilyBloom(0.58);
    topFlower.position.set(0.0, 0.75, -0.1);
    topFlower.rotation.set(0.65, 0.2, 0.0);
    this.flowerGroups.push(topFlower);
    this.group.add(topFlower);

    // Batang Utama
    const mainStemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 0.75, -0.1),
      new THREE.Vector3(-0.1, 0.35, -0.02),
      new THREE.Vector3(0.05, -0.15, 0.05),
      new THREE.Vector3(0.02, -0.95, 0.0),
    ]);
    const mainStem = new THREE.Mesh(new THREE.TubeGeometry(mainStemCurve, 24, 0.045, 8, false), stemMat);
    this.group.add(mainStem);

    const bMainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, -0.15, 0.05),
      new THREE.Vector3(0.1, -0.05, 0.12),
      new THREE.Vector3(0.15, 0.05, 0.2),
    ]);
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(bMainCurve, 8, 0.035, 6, false), stemMat));

    const bLeftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 0.35, -0.02),
      new THREE.Vector3(-0.22, 0.35, 0.02),
      new THREE.Vector3(-0.35, 0.35, 0.05),
    ]);
    this.group.add(new THREE.Mesh(new THREE.TubeGeometry(bLeftCurve, 8, 0.035, 6, false), stemMat));

    // Daun Botani
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x1e7e34,
      roughness: 0.45,
      side: THREE.DoubleSide,
    });

    const createLeafGeo = () => {
      const geom = new THREE.PlaneGeometry(0.3, 1.2, 12, 18);
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const normY = (y + 0.6) / 1.2;
        const w = Math.sin(normY * Math.PI);
        pos.setX(i, pos.getX(i) * w);
        pos.setZ(i, -Math.sin(normY * Math.PI * 0.7) * 0.12);
      }
      geom.computeVertexNormals();
      return geom;
    };
    const leafGeo = createLeafGeo();

    const leafPositions = [
      { pos: [-0.15, 0.1, 0.05], rot: [0.3, -0.9, 0.4] },
      { pos: [0.12, -0.4, 0.08], rot: [-0.2, 1.0, -0.4] },
      { pos: [-0.08, -0.65, -0.02], rot: [0.4, -1.2, 0.3] },
    ];
    leafPositions.forEach((lp) => {
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(lp.pos[0], lp.pos[1], lp.pos[2]);
      leaf.rotation.set(lp.rot[0], lp.rot[1], lp.rot[2]);
      this.leaves.push(leaf);
      this.group.add(leaf);
    });

    // Partikel Cahaya Lembut
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 1.5;
      pPos[i * 3 + 1] = -0.7 + Math.random() * 1.8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.03,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.pollenParticles = new THREE.Points(pGeo, pMat);
    this.group.add(this.pollenParticles);
  }

  public update(time: number) {
    const breath = Math.sin(time * 1.5) * 0.02;
    const sway = Math.sin(time * 1.1) * 0.025;

    this.flowerGroups[0].rotation.z = -0.3 + sway;
    this.flowerGroups[1].rotation.z = 0.4 - sway;
    this.flowerGroups[2].rotation.x = 0.65 + breath;

    const pos = this.pollenParticles.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += 0.005;
      if (pos[i * 3 + 1] > 1.1) {
        pos[i * 3 + 1] = -0.7;
      }
    }
    this.pollenParticles.geometry.attributes.position.needsUpdate = true;
  }
}
