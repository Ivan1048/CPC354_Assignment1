import { unionStrokes } from "./union.js";
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

    const polygons = strokes.split(",").map(segment => {
      const rectangle = RECT_SEGMENTS[segment];
      return rectangle
        ? createRectanglePolygon(...rectangle)
        : createDiagonalPolygon(...DIAG_SEGMENTS[segment]);
    });
    const { faces, edges } = unionStrokes(polygons);
    const point = ([x, y], z) => [x + xOffset, y - 0.75, z];
    // Disjoint face pieces avoid coplanar overlap; internal stroke walls disappear.
    for (const face of faces) {
      for (let i = 1; i < face.length - 1; i++) {
        pushTriangle(
          point(face[0], zFront), point(face[i], zFront), point(face[i + 1], zFront),
          [0, 0, 1], frontColor,
        );
        pushTriangle(
          point(face[i + 1], zBack), point(face[i], zBack), point(face[0], zBack),
          [0, 0, -1], sideColor,
        );
      }
    }
    for (const [a, b] of edges) {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const length = Math.hypot(dx, dy);
      const normal = [dy / length, -dx / length, 0];
      pushTriangle(
        point(a, zFront), point(a, zBack), point(b, zBack), normal, sideColor,
      );
      pushTriangle(
        point(a, zFront), point(b, zBack), point(b, zFront), normal, sideColor,
      );
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
