// physics.js
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

export class PhysicsEngine {
  constructor() {
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, -9.82, 0),
    });

    this.fixedTimeStep = 1 / 60;
    this.maxSubSteps = 3;

    this.beforeStep = [];
    this.afterStep = [];
  }

  addBody(body) {
    this.world.addBody(body);
  }

  addStaticBox(x, y, z, sx, sy, sz) {
    const shape = new CANNON.Box(new CANNON.Vec3(sx / 2, sy / 2, sz / 2));
    const body = new CANNON.Body({ mass: 0, shape });
    body.position.set(x, y, z);
    this.world.addBody(body);
    return body;
  }

  step(deltaTime) {
    this.beforeStep.forEach(cb => cb());
    this.world.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
    this.afterStep.forEach(cb => cb());
  }

  onBeforeStep(callback) {
    this.beforeStep.push(callback);
  }

  onAfterStep(callback) {
    this.afterStep.push(callback);
  }

  getWorld() {
    return this.world;
  }
}
