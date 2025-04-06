// main.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.1/examples/jsm/controls/OrbitControls.js';
import { PhysicsEngine } from './physics.js';
import { Player } from './player.js';

// === SCENE SETUP ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// === LIGHTING ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// === PHYSICS ===
const physics = new PhysicsEngine();
const world = physics.getWorld();

// === PLAYER ===
const player = new Player(world, camera);

// === GROUND ===
const groundGeo = new THREE.BoxGeometry(32, 1, 32);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const groundMesh = new THREE.Mesh(groundGeo, groundMat);
groundMesh.position.set(0, -0.5, 0);
scene.add(groundMesh);
physics.addStaticBox(0, -0.5, 0, 32, 1, 32);

// === WINDOW RESIZE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// === DEBUG CONTROLS (Optional) ===
// const controls = new OrbitControls(camera, renderer.domElement);

// === GAME LOOP ===
let lastTime = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  physics.step(delta);
  player.update();

  renderer.render(scene, camera);
}

animate();
