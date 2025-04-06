// player.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export class Player {
  constructor(world, camera) {
    this.world = world;
    this.camera = camera;

    this.velocity = { forward: 0, strafe: 0 };
    this.pitch = 0;
    this.yaw = 0;
    this.speed = 5;

    this.initBody();
    this.addListeners();
  }

  initBody() {
    const shape = new CANNON.Sphere(0.5);
    this.body = new CANNON.Body({ mass: 1, shape });
    this.body.position.set(0, 2, 0);
    this.world.addBody(this.body);
  }

  addListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') this.velocity.forward = 1;
      if (e.code === 'KeyS') this.velocity.forward = -1;
      if (e.code === 'KeyA') this.velocity.strafe = -1;
      if (e.code === 'KeyD') this.velocity.strafe = 1;
    });

    document.addEventListener('keyup', (e) => {
      if (e.code === 'KeyW' || e.code === 'KeyS') this.velocity.forward = 0;
      if (e.code === 'KeyA' || e.code === 'KeyD') this.velocity.strafe = 0;
    });

    document.body.addEventListener('click', () => {
      document.body.requestPointerLock();
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement) {
        document.addEventListener('mousemove', this.onMouseMove);
      } else {
        document.removeEventListener('mousemove', this.onMouseMove);
      }
    });

    this.onMouseMove = this.onMouseMove.bind(this);
  }

  onMouseMove(e) {
    this.yaw -= e.movementX * 0.002;
    this.pitch -= e.movementY * 0.002;
    this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
  }

  update() {
    // Movement
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);

    const right = new THREE.Vector3().crossVectors(dir, this.camera.up).normalize();
    const move = new CANNON.Vec3();

    move.x = dir.x * this.velocity.forward + right.x * this.velocity.strafe;
    move.z = dir.z * this.velocity.forward + right.z * this.velocity.strafe;
    move.normalize();
    move.scale(this.speed, move);

    this.body.velocity.x = move.x;
    this.body.velocity.z = move.z;

    // Camera sync
    this.camera.position.copy(this.body.position);
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }
}
