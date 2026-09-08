import * as THREE from 'three';

export class BoundingBox {
  public group: THREE.Group;
  private lineSegments: THREE.LineSegments;
  private cornerSpheres: THREE.Mesh[] = [];

  constructor(size: number = 2.4, color: number = 0xffffff) {
    this.group = new THREE.Group();
    const half = size / 2;

    // Garis kawat wireframe
    const geometry = new THREE.BoxGeometry(size, size, size);
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.85,
    });
    this.lineSegments = new THREE.LineSegments(edges, lineMat);
    this.group.add(this.lineSegments);

    // 8 Titik Sudut Putih Solid (Identik video)
    const sphereGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const corners = [
      [-half, -half, -half], [half, -half, -half],
      [half, half, -half],   [-half, half, -half],
      [-half, -half, half],  [half, -half, half],
      [half, half, half],    [-half, half, half],
    ];

    corners.forEach((pos) => {
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(pos[0], pos[1], pos[2]);
      this.cornerSpheres.push(mesh);
      this.group.add(mesh);
    });
  }

  public update(time: number) {
    const pulse = 1 + Math.sin(time * 4) * 0.12;
    this.cornerSpheres.forEach((s) => s.scale.set(pulse, pulse, pulse));
  }
}
