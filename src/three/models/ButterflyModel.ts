import * as THREE from 'three';

export class ButterflyModel {
  public group: THREE.Group;
  private leftForeWing: THREE.Mesh;
  private leftHindWing: THREE.Mesh;
  private rightForeWing: THREE.Mesh;
  private rightHindWing: THREE.Mesh;
  private leftAntenna: THREE.Mesh;
  private rightAntenna: THREE.Mesh;
  private dustPoints: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    // Kanvas Tekstur Sayap Morpho Biru Metalik
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Bingkai beludru hitam
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, 512, 512);

    // Gradien biru morpho bercahaya
    const radial = ctx.createRadialGradient(220, 260, 20, 256, 256, 240);
    radial.addColorStop(0, '#f0f9ff'); // kilau putih tengah
    radial.addColorStop(0.2, '#38bdf8'); // biru langit
    radial.addColorStop(0.55, '#0284c7'); // biru elektrik
    radial.addColorStop(0.85, '#1e3a8a'); // navy pekat
    radial.addColorStop(1.0, '#020617'); // tepi hitam

    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(256, 256, 235, 0, Math.PI * 2);
    ctx.fill();

    // Urat sayap bercabang
    ctx.strokeStyle = 'rgba(2, 6, 23, 0.55)';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(80, 256);
      const angle = (i / 16) * Math.PI - Math.PI / 2;
      ctx.quadraticCurveTo(240, 256 + Math.sin(angle) * 130, 490, 256 + Math.sin(angle) * 230);
      ctx.stroke();
    }

    // Bintik putih pinggir sayap
    ctx.fillStyle = '#ffffff';
    for (let a = 0; a < Math.PI * 1.6; a += 0.2) {
      const px = 256 + Math.cos(a) * 238;
      const py = 256 + Math.sin(a) * 238;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const wingTexture = new THREE.CanvasTexture(canvas);

    const wingMat = new THREE.MeshStandardMaterial({
      map: wingTexture,
      side: THREE.DoubleSide,
      roughness: 0.22,
      metalness: 0.45,
    });

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Toraks & Abdomen
    const thoraxGeo = new THREE.CylinderGeometry(0.048, 0.035, 0.4, 8);
    const thorax = new THREE.Mesh(thoraxGeo, bodyMat);
    thorax.rotation.x = Math.PI / 2.4;
    this.group.add(thorax);

    const abdomenGeo = new THREE.ConeGeometry(0.04, 0.5, 8);
    const abdomen = new THREE.Mesh(abdomenGeo, bodyMat);
    abdomen.position.set(0, -0.1, -0.32);
    abdomen.rotation.x = -Math.PI / 2.3;
    this.group.add(abdomen);

    // Kepala & Antena
    const headGeo = new THREE.SphereGeometry(0.065, 8, 8);
    const head = new THREE.Mesh(headGeo, bodyMat);
    head.position.set(0, 0.12, 0.25);
    this.group.add(head);

    const antGeo = new THREE.CylinderGeometry(0.008, 0.014, 0.45, 6);
    this.leftAntenna = new THREE.Mesh(antGeo, bodyMat);
    this.leftAntenna.position.set(-0.06, 0.3, 0.38);
    this.leftAntenna.rotation.set(0.65, 0, -0.42);
    this.group.add(this.leftAntenna);

    this.rightAntenna = new THREE.Mesh(antGeo, bodyMat);
    this.rightAntenna.position.set(0.06, 0.3, 0.38);
    this.rightAntenna.rotation.set(0.65, 0, 0.42);
    this.group.add(this.rightAntenna);

    // Sayap Depan & Belakang Mandiri
    const leftForeShape = new THREE.Shape();
    leftForeShape.moveTo(0, 0);
    leftForeShape.bezierCurveTo(-0.4, 0.4, -0.9, 0.88, -1.3, 0.82);
    leftForeShape.bezierCurveTo(-1.4, 0.5, -1.2, 0.1, -0.78, -0.16);
    leftForeShape.bezierCurveTo(-0.4, -0.16, -0.2, -0.05, 0, 0);
    this.leftForeWing = new THREE.Mesh(new THREE.ShapeGeometry(leftForeShape, 16), wingMat);
    this.leftForeWing.position.set(-0.04, 0.06, 0.1);
    this.group.add(this.leftForeWing);

    const leftHindShape = new THREE.Shape();
    leftHindShape.moveTo(0, -0.05);
    leftHindShape.bezierCurveTo(-0.35, -0.15, -0.88, -0.32, -0.92, -0.75);
    leftHindShape.bezierCurveTo(-0.68, -1.0, -0.26, -0.88, 0, -0.4);
    leftHindShape.closePath();
    this.leftHindWing = new THREE.Mesh(new THREE.ShapeGeometry(leftHindShape, 16), wingMat);
    this.leftHindWing.position.set(-0.04, 0.04, 0.02);
    this.group.add(this.leftHindWing);

    const rightForeShape = new THREE.Shape();
    rightForeShape.moveTo(0, 0);
    rightForeShape.bezierCurveTo(0.4, 0.4, 0.9, 0.88, 1.3, 0.82);
    rightForeShape.bezierCurveTo(1.4, 0.5, 1.2, 0.1, 0.78, -0.16);
    rightForeShape.bezierCurveTo(0.4, -0.16, 0.2, -0.05, 0, 0);
    this.rightForeWing = new THREE.Mesh(new THREE.ShapeGeometry(rightForeShape, 16), wingMat);
    this.rightForeWing.position.set(0.04, 0.06, 0.1);
    this.group.add(this.rightForeWing);

    const rightHindShape = new THREE.Shape();
    rightHindShape.moveTo(0, -0.05);
    rightHindShape.bezierCurveTo(0.35, -0.15, 0.88, -0.32, 0.92, -0.75);
    rightHindShape.bezierCurveTo(0.68, -1.0, 0.26, -0.88, 0, -0.4);
    rightHindShape.closePath();
    this.rightHindWing = new THREE.Mesh(new THREE.ShapeGeometry(rightHindShape, 16), wingMat);
    this.rightHindWing.position.set(0.04, 0.04, 0.02);
    this.group.add(this.rightHindWing);

    // Partikel Serbuk Biru Bercahaya
    const dustCount = 140;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 1.4;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 1.0;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 1.4;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.045,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    this.dustPoints = new THREE.Points(dustGeo, dustMat);
    this.group.add(this.dustPoints);

    this.group.scale.set(1.4, 1.4, 1.4);
  }

  public update(time: number) {
    // Kepakan sayap alami dengan jeda fase
    const foreFlap = Math.sin(time * 11) * 0.92;
    const hindFlap = Math.sin(time * 11 - 0.3) * 0.82;

    this.leftForeWing.rotation.y = foreFlap;
    this.rightForeWing.rotation.y = -foreFlap;
    this.leftHindWing.rotation.y = hindFlap;
    this.rightHindWing.rotation.y = -hindFlap;

    // Getaran antena
    this.leftAntenna.rotation.z = -0.42 + Math.sin(time * 8) * 0.05;
    this.rightAntenna.rotation.z = 0.42 - Math.sin(time * 8) * 0.05;

    // Pola terbang melayang
    this.group.position.y = Math.sin(time * 3.5) * 0.16 + Math.sin(time * 11) * 0.03;
    this.group.position.x = Math.sin(time * 1.8) * 0.18;
    this.group.rotation.z = Math.sin(time * 3.5) * 0.14;
    this.group.rotation.x = Math.sin(time * 2.2) * 0.1;
    this.group.rotation.y = Math.cos(time * 1.2) * 0.25;

    // Partikel serbuk jatuh
    const pos = this.dustPoints.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] -= 0.006;
      if (pos[i * 3 + 1] < -0.8) {
        pos[i * 3 + 1] = 0.6;
        pos[i * 3] = (Math.random() - 0.5) * 1.3;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 1.3;
      }
    }
    this.dustPoints.geometry.attributes.position.needsUpdate = true;
  }
}
