// Convex stroke union: disjoint face pieces and exposed boundary edges.
// Input stroke polygons and output face pieces have counter-clockwise winding.
const EPS = 1e-9;
const cross = (a, b, p) =>
  (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
const mix = (a, b, t) => a.map((value, axis) => value + (b[axis] - value) * t);
const inside = (polygon, point) =>
  polygon.every((a, i) => cross(a, polygon[(i + 1) % polygon.length], point) >= -EPS);

function signedArea(polygon) {
  return polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return sum + p[0] * q[1] - q[0] * p[1];
  }, 0) / 2;
}

/** Clip a convex polygon to either side of an oriented line. */
function clip(polygon, a, b, sign) {
  const output = [];
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    const q = polygon[(i + 1) % polygon.length];
    const dp = sign * cross(a, b, p);
    const dq = sign * cross(a, b, q);
    if (dp >= -EPS) output.push(p);
    if ((dp > EPS && dq < -EPS) || (dp < -EPS && dq > EPS)) {
      output.push(mix(p, q, dp / (dp - dq)));
    }
  }
  return output.filter((p, i) => {
    const next = output[(i + 1) % output.length];
    return Math.hypot(p[0] - next[0], p[1] - next[1]) > EPS;
  });
}

// Outside pieces are disjoint; the remaining inside piece is discarded.
function subtract(polygon, cutter) {
  let remaining = polygon;
  const pieces = [];
  for (let i = 0; i < cutter.length && remaining.length >= 3; i++) {
    const a = cutter[i];
    const b = cutter[(i + 1) % cutter.length];
    const outside = clip(remaining, a, b, -1);
    if (outside.length >= 3 && signedArea(outside) > EPS) pieces.push(outside);
    remaining = clip(remaining, a, b, 1);
  }
  return pieces;
}

export function unionStrokes(polygons) {
  const faces = [];
  polygons.forEach((polygon, index) => {
    let pieces = [polygon];
    for (const previous of polygons.slice(0, index)) {
      pieces = pieces.flatMap(piece => subtract(piece, previous));
    }
    faces.push(...pieces);
  });

  const edges = [];
  polygons.forEach((polygon, index) => polygon.forEach((a, i) => {
    const b = polygon[(i + 1) % polygon.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const length = Math.hypot(dx, dy);
    const cuts = [0, 1];
    // Split at every crossing and collinear overlap endpoint before coverage tests.
    for (const other of polygons) {
      for (let j = 0; j < other.length; j++) {
        const c = other[j];
        const d = other[(j + 1) % other.length];
        const ex = d[0] - c[0];
        const ey = d[1] - c[1];
        const denominator = dx * ey - dy * ex;
        if (Math.abs(denominator) > EPS) {
          const t = ((c[0] - a[0]) * ey - (c[1] - a[1]) * ex) / denominator;
          const u = ((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / denominator;
          if (t > EPS && t < 1 - EPS && u >= -EPS && u <= 1 + EPS) cuts.push(t);
        } else if (Math.abs(cross(a, b, c)) < EPS) {
          for (const point of [c, d]) {
            const t = ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length ** 2;
            if (t > EPS && t < 1 - EPS) cuts.push(t);
          }
        }
      }
    }
    cuts.sort((x, y) => x - y);
    for (let j = 1; j < cuts.length; j++) {
      if (cuts[j] - cuts[j - 1] < EPS) continue;
      const midpoint = mix(a, b, (cuts[j] + cuts[j - 1]) / 2);
      const outside = [midpoint[0] + dy / length * 1e-7, midpoint[1] - dx / length * 1e-7];
      if (polygons.some(other => inside(other, outside))) continue;
      // Identical overlapping boundary segments are emitted once.
      const duplicate = polygons.slice(0, index).some(other =>
        other.some((c, k) =>
          Math.abs(cross(c, other[(k + 1) % other.length], midpoint)) < EPS &&
          inside(other, midpoint)));
      if (!duplicate) edges.push([mix(a, b, cuts[j - 1]), mix(a, b, cuts[j])]);
    }
  }));
  return { faces, edges };
}
