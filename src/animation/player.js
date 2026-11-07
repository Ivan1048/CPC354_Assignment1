import { computeIdentPose, initialPose, smoothstep } from "./ident.js";

/** Owns playback time without depending on the DOM, a camera, or a WebGL context. */
export class AnimationPlayer {
  phase = "ready";
  elapsed = 0;
  paused = false;
  #lastTimestamp = null;
  #motion = null;
  #autoLoop = null;
  #transition = null;
  #pose = null;

  start() {
    this.phase = "playing";
    this.elapsed = 0;
    this.paused = false;
    this.#motion = null;
    this.#autoLoop = null;
    this.#transition = null;
    this.#pose = null;
    this.resetClock();
  }

  reset() {
    this.phase = "ready";
    this.elapsed = 0;
    this.paused = false;
    this.#motion = null;
    this.#autoLoop = null;
    this.#transition = null;
    this.#pose = null;
    this.resetClock();
  }

  togglePause() {
    if (this.phase !== "playing") return;
    this.paused = !this.paused;
    this.resetClock();
  }

  resetClock() {
    this.#lastTimestamp = null;
  }

  update(timestamp, speed, active = true) {
    const previous = this.#lastTimestamp;
    this.#lastTimestamp = active ? timestamp : null;
    if (
      previous !== null &&
      active &&
      this.phase === "playing" &&
      !this.paused
    ) {
      // Integrate speed over each real frame interval: changing speed cannot jump the timeline.
      this.elapsed += (Math.max(0, timestamp - previous) / 1000) * speed;
    }
  }

  getPose(settings) {
    if (this.phase !== "playing") return initialPose();
    const motion = settings.motion ?? "hover";
    const autoLoop = Boolean(settings.autoLoop);
    const target = computeIdentPose(this.elapsed, settings);
    if (this.#motion !== null && this.#pose &&
        (motion !== this.#motion || autoLoop !== this.#autoLoop)) {
      const difference = target.rotY - this.#pose.rotY;
      this.#transition = {
        start: this.elapsed,
        from: this.#pose,
        lastTargetAngle: target.rotY,
        targetAngle: this.#pose.rotY + Math.atan2(Math.sin(difference), Math.cos(difference)),
      };
    }
    this.#motion = motion;
    this.#autoLoop = autoLoop;
    let pose = target;
    if (this.#transition) {
      const t = smoothstep((this.elapsed - this.#transition.start) / 0.65);
      const transition = this.#transition;
      const from = transition.from;
      // Unwrap the moving target continuously. Re-selecting the shortest path
      // each frame would flip direction when the target passes a half turn.
      const difference = target.rotY - transition.lastTargetAngle;
      transition.targetAngle += Math.atan2(Math.sin(difference), Math.cos(difference));
      transition.lastTargetAngle = target.rotY;
      pose = { ...target };
      for (const key of ["rotX", "scale", "tx", "ty", "rotY"]) {
        const end = key === "rotY" ? transition.targetAngle : target[key];
        pose[key] = from[key] + (end - from[key]) * t;
      }
      if (t === 1) this.#transition = null;
    }
    this.#pose = pose;
    return pose;
  }
}
