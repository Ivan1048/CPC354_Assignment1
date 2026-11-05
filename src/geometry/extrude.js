import {
  RECT_SEGMENTS,
  DIAG_SEGMENTS,
  GLYPH_MAP,
  createRectanglePolygon,
  createDiagonalPolygon,
} from "./glyphs.js";
import { hexToRgb, mixRgb, RAINBOW_PALETTE } from "../utils/colors.js";

// Interleaved CPU mesh: position (3), normal (3), color (3). No WebGL dependency.
export const FLOATS_PER_VERTEX = 9;
export const STRIDE_BYTES = FLOATS_PER_VERTEX * Float32Array.BYTES_PER_ELEMENT;

export function buildGeometry(state) {
  const vertexData = [];

  // Helper to push a triangle's 3 vertices (each with position, normal, color)
  function pushTriangle(p1, p2, p3, normal, color) {
    const triVertices = [p1, p2, p3];
    for (let i = 0; i < triVertices.length; i++) {
      const v = triVertices[i];
      vertexData.push(
        v[0],
        v[1],
        v[2], // Position: X, Y, Z
        normal[0],
        normal[1],
        normal[2], // Normal: NX, NY, NZ
        color[0],
        color[1],
        color[2], // Color: R, G, B
      );
    }
  }

  const frontBaseColor = hexToRgb(state.front);
  const sideBaseColor = hexToRgb(state.side);
  const letterSpacing = 1.25;
  const totalWordWidth = state.word.length * letterSpacing - 0.25;

  // Process each letter of the active word
  const letters = state.word.split("");
  for (let charIndex = 0; charIndex < letters.length; charIndex++) {
    const letter = letters[charIndex];
    const xOffset = charIndex * letterSpacing - totalWordWidth / 2.0;
    const zFront = state.depth / 2.0;
    const zBack = -state.depth / 2.0;

    // Determine front and side colors based on selected mode
    let frontColor = frontBaseColor;
    let sideColor = sideBaseColor;

    if (state.colorMode === "rainbow") {
      frontColor = hexToRgb(
        RAINBOW_PALETTE[charIndex % RAINBOW_PALETTE.length],
      );
      sideColor = mixRgb(frontColor, [0.07, 0.08, 0.24], 0.4);
    } else if (state.colorMode === "single") {
      sideColor = frontColor;
    }

    const strokes = GLYPH_MAP[letter];
    if (!strokes) {
      throw new Error("Unsupported character in word: " + letter);
    }

    const segmentNames = strokes.split(",");
    for (let s = 0; s < segmentNames.length; s++) {
      const seg = segmentNames[s];

      // Generate 2D quad polygon in local space
      let polygon2D;
      if (RECT_SEGMENTS[seg]) {
        const r = RECT_SEGMENTS[seg];
        polygon2D = createRectanglePolygon(r[0], r[1], r[2], r[3]);
      } else if (DIAG_SEGMENTS[seg]) {
        const d = DIAG_SEGMENTS[seg];
        polygon2D = createDiagonalPolygon(d[0], d[1], d[2], d[3]);
      } else {
        continue;
      }

      // Center polygon vertically (Y - 0.75) and offset horizontally by letter slot
      const shifted2D = polygon2D.map(([px, py]) => [px + xOffset, py - 0.75]);

      // Construct 3D front (+Z) and back (-Z) vertices
      const frontVertices = shifted2D.map(([px, py]) => [px, py, zFront]);
      const backVertices = shifted2D.map(([px, py]) => [px, py, zBack]);

      // --- 1. FRONT FACE (Normal pointing towards viewer: [0, 0, 1]) ---
      // Triangulate CCW quad: (0, 1, 2) and (0, 2, 3)
      pushTriangle(
        frontVertices[0],
        frontVertices[1],
        frontVertices[2],
        [0, 0, 1],
        frontColor,
      );
      pushTriangle(
        frontVertices[0],
        frontVertices[2],
        frontVertices[3],
        [0, 0, 1],
        frontColor,
      );

      // --- 2. BACK FACE (Normal pointing away from viewer: [0, 0, -1]) ---
      // Triangulate CW quad reversed to keep outward normal: (2, 1, 0) and (3, 2, 0)
      pushTriangle(
        backVertices[2],
        backVertices[1],
        backVertices[0],
        [0, 0, -1],
        sideColor,
      );
      pushTriangle(
        backVertices[3],
        backVertices[2],
        backVertices[0],
        [0, 0, -1],
        sideColor,
      );

      // --- 3. EXTRUDED SIDE WALLS (Connecting each front edge to its back edge) ---
      for (let edge = 0; edge < 4; edge++) {
        const nextEdge = (edge + 1) % 4;

        // Calculate edge direction and outward 2D perpendicular normal
        const dx = shifted2D[nextEdge][0] - shifted2D[edge][0];
        const dy = shifted2D[nextEdge][1] - shifted2D[edge][1];
        const edgeLength = Math.hypot(dx, dy);
        const outwardNormal = [dy / edgeLength, -dx / edgeLength, 0.0];

        // Quad formed by: Front[edge], Back[edge], Back[nextEdge], Front[nextEdge]
        pushTriangle(
          frontVertices[edge],
          backVertices[edge],
          backVertices[nextEdge],
          outwardNormal,
          sideColor,
        );
        pushTriangle(
          frontVertices[edge],
          backVertices[nextEdge],
          frontVertices[nextEdge],
          outwardNormal,
          sideColor,
        );
      }
    }
  }

  const vertices = new Float32Array(vertexData);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let offset = 0; offset < vertices.length; offset += FLOATS_PER_VERTEX) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], vertices[offset + axis]);
      max[axis] = Math.max(max[axis], vertices[offset + axis]);
    }
  }
  return {
    vertices,
    vertexCount: vertices.length / FLOATS_PER_VERTEX,
    bounds: vertices.length ? { min, max } : { min: [0, 0, 0], max: [0, 0, 0] },
  };
}
