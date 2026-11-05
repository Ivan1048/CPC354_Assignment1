import { computeIdentPose, initialPose } from "./ident.js";

/** Owns playback time without depending on the DOM, a camera, or a WebGL context. */
export class AnimationPlayer {
  phase = "ready";
  elapsed = 0;
  paused = false;
  #lastTimestamp = null;

  start() {
    this.phase = "playing";
    this.elapsed = 0;
    this.paused = false;
    this.resetClock();
  }

  reset() {
    this.phase = "ready";
    this.elapsed = 0;
    this.paused = false;
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
    return this.phase === "playing"
      ? computeIdentPose(this.elapsed, settings)
      : initialPose();
  }
}
