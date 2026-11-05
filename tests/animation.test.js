import test from "node:test";
import assert from "node:assert/strict";
import {
  computeIdentPose,
  HERO_SCALE,
  INITIAL_SCALE,
  SEQUENCE_DURATION,
  FINAL_MOTION_DURATION,
  REPEAT_DURATION,
} from "../src/animation/ident.js";
import { AnimationPlayer } from "../src/animation/player.js";

const close = (actual, expected, tolerance = 1e-6) =>
  assert.ok(
    Math.abs(actual - expected) < tolerance,
    `${actual} should be close to ${expected}`,
  );

function samePose(a, b, tolerance = 1e-5) {
  for (const key of ["scale", "tx", "ty", "rotX"])
    close(a[key], b[key], tolerance);
  // Equivalent full turns have the same rendered orientation.
  close(Math.sin(a.rotY), Math.sin(b.rotY), tolerance);
  close(Math.cos(a.rotY), Math.cos(b.rotY), tolerance);
}

test("the required right, return, left, return, and enlargement stages reach their targets", () => {
  for (const [time, angle] of [
    [0, 0],
    [0.9, Math.PI / 2],
    [1.8, Math.PI],
    [3.6, 0],
    [5.4, -Math.PI],
    [7.2, 0],
  ]) {
    const pose = computeIdentPose(time);
    close(pose.rotY, angle);
    close(pose.tx, 0);
    close(pose.ty, 0);
    close(pose.scale, INITIAL_SCALE);
  }
  close(computeIdentPose(8.3).scale, (INITIAL_SCALE + HERO_SCALE) / 2);
  close(computeIdentPose(SEQUENCE_DURATION).scale, HERO_SCALE);
});

test("all final motion modes enter continuously and stay enlarged without full repeats", () => {
  for (const motion of ["hover", "spin", "orbit"]) {
    samePose(
      computeIdentPose(SEQUENCE_DURATION - 1e-7, { motion }),
      computeIdentPose(SEQUENCE_DURATION, { motion }),
    );
    close(computeIdentPose(100, { motion }).scale, HERO_SCALE);
    const later = computeIdentPose(SEQUENCE_DURATION + 2, { motion });
    assert.ok(
      Math.abs(later.rotY) + Math.abs(later.tx) + Math.abs(later.ty) > 0,
    );
  }
});

test("optional full repeats have no pose jump at either return boundary", () => {
  for (const motion of ["hover", "spin", "orbit"]) {
    const settings = { motion, autoLoop: true };
    const returnAt = SEQUENCE_DURATION + FINAL_MOTION_DURATION;
    samePose(
      computeIdentPose(returnAt - 1e-7, settings),
      computeIdentPose(returnAt, settings),
    );
    samePose(
      computeIdentPose(REPEAT_DURATION - 1e-7, settings),
      computeIdentPose(REPEAT_DURATION, settings),
    );
    assert.equal(
      computeIdentPose(returnAt + 0.5, settings).label,
      "Return to start",
    );
  }
});

test("playback integrates speed changes and pause/resume excludes paused time", () => {
  const player = new AnimationPlayer();
  player.start();
  player.update(1000, 1);
  player.update(1500, 1);
  close(player.elapsed, 0.5);
  player.update(1750, 3);
  close(player.elapsed, 1.25);
  player.togglePause();
  player.update(2000, 3);
  player.update(5000, 3);
  close(player.elapsed, 1.25);
  player.togglePause();
  player.update(6000, 1);
  player.update(6500, 1);
  close(player.elapsed, 1.75);
  player.reset();
  player.update(7000, 1);
  close(player.elapsed, 0);
  assert.equal(player.phase, "ready");
  close(player.getPose({}).scale, INITIAL_SCALE);
});

test("background tabs do not advance time and slow visible frames retain real-time speed", () => {
  const player = new AnimationPlayer();
  player.start();
  player.update(0, 1);
  player.update(500, 1);
  close(player.elapsed, 0.5);
  player.update(1000, 1, false);
  player.update(5000, 1);
  close(player.elapsed, 0.5);
  player.update(5500, 1);
  close(player.elapsed, 1);
});
