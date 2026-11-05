/** Animation poses use radians, world-space translation, and uniform scale. */
export const INITIAL_SCALE = 0.7;
export const HERO_SCALE = 1.25;

export const IDENT_STAGES = Object.freeze([
  { name: "Rotate right 180°", duration: 1.8, fromAngle: 0, toAngle: Math.PI },
  { name: "Return to front", duration: 1.8, fromAngle: Math.PI, toAngle: 0 },
  { name: "Rotate left 180°", duration: 1.8, fromAngle: 0, toAngle: -Math.PI },
  { name: "Return to front", duration: 1.8, fromAngle: -Math.PI, toAngle: 0 },
  {
    name: "Enlarge to hero size",
    duration: 2.2,
    fromScale: INITIAL_SCALE,
    toScale: HERO_SCALE,
  },
]);

export const SEQUENCE_DURATION = IDENT_STAGES.reduce(
  (sum, stage) => sum + stage.duration,
  0,
);
export const FINAL_MOTION_DURATION = 9;
export const RETURN_DURATION = 1.4;
export const REPEAT_DURATION =
  SEQUENCE_DURATION + FINAL_MOTION_DURATION + RETURN_DURATION;

export function smoothstep(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

const lerp = (a, b, t) => a + (b - a) * t;

export function initialPose(label = "Ready to start") {
  return { rotY: 0, rotX: 0, scale: INITIAL_SCALE, tx: 0, ty: 0, label };
}

function finalMotionPose(time, motion) {
  const pose = {
    ...initialPose(`Final motion · ${motion}`),
    scale: HERO_SCALE,
  };
  if (motion === "spin") {
    pose.rotY = time * 0.55;
    pose.ty = 0.09 * Math.sin(time * 1.1);
  } else if (motion === "orbit") {
    pose.tx = 0.3 * Math.sin(time * 0.8);
    pose.ty = 0.17 * Math.sin(time * 1.6);
    pose.rotY = 0.28 * Math.sin(time * 0.7);
    // Every component starts at zero to meet the preceding enlargement pose.
    pose.rotX = 0.1 * Math.sin(time * 0.9);
  } else {
    pose.rotY = 0.23 * Math.sin(time * 0.9);
    pose.rotX = 0.12 * Math.sin(time * 0.6);
    pose.ty = 0.15 * Math.sin(time * 1.5);
  }
  return pose;
}

/** Pure timeline: callers choose playback state; this function only computes a pose. */
export function computeIdentPose(
  elapsed,
  { motion = "hover", autoLoop = false } = {},
) {
  const time = autoLoop
    ? Math.max(0, elapsed) % REPEAT_DURATION
    : Math.max(0, elapsed);
  if (time < SEQUENCE_DURATION) {
    let localTime = time;
    for (const stage of IDENT_STAGES) {
      if (localTime <= stage.duration) {
        const pose = initialPose(stage.name);
        const t = smoothstep(localTime / stage.duration);
        if (stage.fromAngle !== undefined) {
          pose.rotY = lerp(stage.fromAngle, stage.toAngle, t);
        } else {
          pose.scale = lerp(stage.fromScale, stage.toScale, t);
        }
        return pose;
      }
      localTime -= stage.duration;
    }
  }

  const motionTime = time - SEQUENCE_DURATION;
  if (!autoLoop || motionTime < FINAL_MOTION_DURATION) {
    return finalMotionPose(motionTime, motion);
  }

  // Optional full repeats return smoothly to the starting size and orientation.
  // For a spin, use the nearest equivalent full turn rather than unwinding it.
  const start = finalMotionPose(FINAL_MOTION_DURATION, motion);
  const t = smoothstep((motionTime - FINAL_MOTION_DURATION) / RETURN_DURATION);
  const fullTurn = Math.PI * 2;
  const targetAngle = Math.round(start.rotY / fullTurn) * fullTurn;
  return {
    rotY: lerp(start.rotY, targetAngle, t),
    rotX: lerp(start.rotX, 0, t),
    scale: lerp(start.scale, INITIAL_SCALE, t),
    tx: lerp(start.tx, 0, t),
    ty: lerp(start.ty, 0, t),
    label: "Return to start",
  };
}
