import { createWorld } from '../static/js/bitecs.js'

import animationSystem from './systems/animation.js'
import spritesheetSystem from './systems/spritesheet.js'
import cameraSystem from './systems/camera.js'
import rendererSystem from './systems/renderer.js'
import audioSystem from './systems/audio.js'
import inputSystem from './systems/input.js'
import animatorSystem from './systems/animator.js'
import colliderSystem from './systems/collider.js'
import physicsSystem from './systems/physics.js'
import statsSystem from './systems/stats.js'
import collectSystem from './systems/collect.js'
import groundCheckSystem from './systems/ground-check.js'
import removalSystem from './systems/removal.js'
import checkpointSystem from './systems/checkpoint.js'
import respawnSystem from './systems/respawn.js'
import resourceLoader from './systems/resource-loader.js'
import sceneLoader from './systems/scene-loader.js'
import eventSystem from './systems/events.js'
import textSystem from './systems/text.js'
import movementSystem from './systems/movement.js'
import oneWayCollisions from './systems/one-way-collisions.js'

import raf from './utils/raf.js'
import { pipeAsync as pipe } from './utils/helpers.js'

async function create() {
  const canvas = TC(document.querySelector('main canvas'))

  const world = createWorld()
  world.time = { fixedDelta: 0, delta: 0, elapsed: 0, elapsedFrames: 0 }
  world.canvas = canvas
  world.scenes = ['title.tmj', 'level-1-inf.tmj', 'mountain.tmj', 'cloud.tmj', 'end.tmj', 'cave.tmj', 'ice.tmj']

  const state = {
    canvas,
    world,
    startSystems: pipe(
      resourceLoader(),
    ),
    updateSystems: pipe(
      sceneLoader(canvas),
      spritesheetSystem(),
      colliderSystem(),
      collectSystem(),
      checkpointSystem(),
      respawnSystem(),
      movementSystem(),
      oneWayCollisions(),
      physicsSystem(world),
      groundCheckSystem(),
      // warpSystem(),
      eventSystem(),
    ),
    renderSystems: pipe(
      statsSystem(),
      inputSystem(),
      audioSystem(world.audioContext),
      animationSystem(),
      animatorSystem(),
      cameraSystem(),
      removalSystem(),
      textSystem(),
      rendererSystem(canvas)
    )
  }

  await state.startSystems(world)

  raf(update.bind(null, state), render.bind(null, state), { fps: 60 })
}

function update(state, dt) {
  state.world.time.fixedDelta = dt
  state.world.time.fixedElapsed += dt

  state.updateSystems(state.world)
}

function render(state, dt) {
  state.world.time.delta = dt
  state.world.time.elapsed += dt
  state.world.time.elapsedFrames++

  state.renderSystems(state.world)
  state.world.actions.update()
}

create()
