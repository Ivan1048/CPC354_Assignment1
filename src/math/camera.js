import { HERO_SCALE } from "../animation/ident.js";

/** A fixed camera fits every rotation and final-motion offset without pumping. */
export function fitCameraDistance(bounds, aspect, fieldOfView = Math.PI / 3) {
  // Rotation preserves radius; include the farthest actual bounding-box corner.
  const extents = bounds.min.map((value, axis) =>
    Math.max(Math.abs(value), Math.abs(bounds.max[axis])));
  const radius = Math.hypot(...extents) * HERO_SCALE;
  const tanY = Math.tan(fieldOfView / 2);
  const tanX = tanY * Math.max(aspect, 1e-4);
  // Sphere tangent distance plus translation allowance and a 10% screen margin.
  const horizontal = radius * Math.sqrt(1 + 1 / (tanX * 0.9) ** 2) + 0.3 / (tanX * 0.9);
  const vertical = radius * Math.sqrt(1 + 1 / (tanY * 0.9) ** 2) + 0.17 / (tanY * 0.9);
  return Math.max(3, horizontal, vertical);
}
