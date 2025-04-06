// chunk-gen.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';

const CHUNK_SIZE = 32;
const RENDER_DISTANCE = 2;

export class ChunkManager {
  constructor(scene, physics, player) {
    this.scene = scene;
    this.physics = physics;
    this.player = player;
    this.chunks = new Map(); // Key: `${x},${z}` → { group, bodies }
  }

  update() {
    const { x, z } = this.player.body.position;
    const cx = Math.floor(x / CHUNK_SIZE);
    const cz = Math.floor(z / CHUNK_SIZE);

    const needed = new Set();
    for (let dx = -RENDER_DISTANCE; dx <= RENDER_DISTANCE; dx++) {
      for (let dz = -RENDER_DISTANCE; dz <= RENDER_DISTANCE; dz++) {
        const key = `${cx + dx},${cz + dz}`;
        needed.add(key);
        if (!this.chunks.has(key)) {
          this.generateChunk(cx + dx, cz + dz);
        }
      }
    }

    // Unload far chunks
    for (const key of this.chunks.keys()) {
      if (!needed.has(key)) {
        this.removeChunk(key);
      }
    }
  }

  generateChunk(cx, cz) {
    const group = new THREE.Group();
    const bodies = [];

    const worldX = cx * CHUNK_SIZE;
    const worldZ = cz * CHUNK_SIZE;

    // Add terrain
    const groundGeo = new THREE.BoxGeometry(CHUNK_SIZE, 1, CHUNK_SIZE);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x2c2c2c });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(worldX, -0.5, worldZ);
    group.add(ground);

    this.physics.addStaticBox(worldX, -0.5, worldZ, CHUNK_SIZE, 1, CHUNK_SIZE);

    // Add simple buildings
    const numBuildings = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numBuildings; i++) {
      const bx = worldX - CHUNK_SIZE/2 + Math.random() * CHUNK_SIZE;
      const bz = worldZ - CHUNK_SIZE/2 + Math.random() * CHUNK_SIZE;
      const bw = 2 + Math.random() * 3;
      const bh = 3 + Math.random() * 6;
      const bd = 2 + Math.random() * 3;

      const buildingGeo = new THREE.BoxGeometry(bw, bh, bd);
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x444444 });
      const building = new THREE.Mesh(buildingGeo, buildingMat);
      building.position.set(bx, bh / 2, bz);
      group.add(building);

      this.physics.addStaticBox(bx, bh / 2, bz, bw, bh, bd);
    }

    this.scene.add(group);
    this.chunks.set(`${cx},${cz}`, { group, bodies });
  }

  removeChunk(key) {
    const chunk = this.chunks.get(key);
    if (!chunk) return;
    this.scene.remove(chunk.group);
    this.chunks.delete(key);
    // No need to manually remove physics — Cannon cleans up unused bodies if GCed
  }
}
