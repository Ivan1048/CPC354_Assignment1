// Standard orthogonal rectangular segments defined as [minX, minY, maxX, maxY]
// Normalized to unit cell: width approx 1.0, height approx 1.5
export const RECT_SEGMENTS = {
  T: [0.09, 1.35, 0.91, 1.49], // Top horizontal bar
  M: [0.13, 0.7, 0.87, 0.84], // Middle horizontal crossbar
  B: [0.09, 0.02, 0.91, 0.16], // Bottom horizontal bar
  UL: [0.02, 0.77, 0.17, 1.4], // Upper-left vertical stroke
  UR: [0.83, 0.77, 0.98, 1.4], // Upper-right vertical stroke
  LL: [0.02, 0.09, 0.17, 0.76], // Lower-left vertical stroke
  LR: [0.83, 0.09, 0.98, 0.76], // Lower-right vertical stroke
  CV: [0.43, 0.08, 0.57, 1.41], // Center full-height vertical
  LOW: [0.43, 0.08, 0.57, 0.78], // Lower-center vertical stem
  GM: [0.43, 0.7, 0.87, 0.84], // G half-width middle bar (right half only: centre→right edge, gives G its inner shelf)
};

// Diagonal segments defined as [startX, startY, endX, endY]
export const DIAG_SEGMENTS = {
  D1: [0.87, 1.43, 0.13, 0.08], // Diagonal top-right to bottom-left
  D2: [0.13, 1.43, 0.87, 0.08], // Diagonal top-left to bottom-right
  D3: [0.11, 1.4, 0.5, 0.76], // Upper-left to center
  D4: [0.89, 1.4, 0.5, 0.76], // Upper-right to center
  D5: [0.13, 0.08, 0.87, 1.43], // Diagonal bottom-left to top-right
  D6: [0.5, 0.08, 0.13, 1.4], // V left arm
  D7: [0.5, 0.08, 0.87, 1.4], // V right arm
  K1: [0.14, 0.73, 0.88, 1.42], // K upper diagonal
  K2: [0.14, 0.73, 0.88, 0.07], // K lower diagonal
  Q1: [0.61, 0.38, 1.02, -0.08], // Q bottom tail
  R1: [0.48, 0.75, 0.92, 0.07], // R lower diagonal leg
  W1: [0.13, 0.1, 0.32, 0.63], // W segment 1
  W2: [0.32, 0.63, 0.5, 0.1], // W segment 2
  W3: [0.5, 0.1, 0.69, 0.63], // W segment 3
  W4: [0.69, 0.63, 0.87, 0.1], // W segment 4
};

// Glyph mapping table: Maps characters A-Z and 0-9 to comma-delimited stroke names
export const GLYPH_MAP = {
  A: "T,M,UL,UR,LL,LR",
  B: "T,M,B,UL,LL,UR,LR",
  C: "T,B,UL,LL",
  D: "T,B,UL,LL,UR,LR",
  E: "T,M,B,UL,LL",
  F: "T,M,UL,LL",
  G: "T,B,UL,LL,LR,GM",
  H: "M,UL,LL,UR,LR",
  I: "T,B,CV",
  J: "B,UR,LR,LL",
  K: "UL,LL,K1,K2",
  L: "B,UL,LL",
  M: "UL,LL,UR,LR,D3,D4",
  N: "UL,LL,UR,LR,D2",
  O: "T,B,UL,LL,UR,LR",
  P: "T,M,UL,LL,UR",
  Q: "T,B,UL,LL,UR,LR,Q1",
  R: "T,M,UL,LL,UR,R1",
  S: "T,M,B,UL,LR",
  T: "T,CV",
  U: "B,UL,LL,UR,LR",
  V: "D6,D7",
  W: "UL,LL,UR,LR,W1,W2,W3,W4",
  X: "D1,D2",
  Y: "D3,D4,LOW",
  Z: "T,B,D1",
  0: "T,B,UL,LL,UR,LR",
  1: "UR,LR",
  2: "T,M,B,UR,LL",
  3: "T,M,B,UR,LR",
  4: "M,UL,UR,LR",
  5: "T,M,B,UL,LR",
  6: "T,M,B,UL,LL,LR",
  7: "T,UR,LR",
  8: "T,M,B,UL,LL,UR,LR",
  9: "T,M,B,UL,UR,LR",
};

// Creates four counter-clockwise vertices for an axis-aligned rectangle
export function createRectanglePolygon(x0, y0, x1, y1) {
  return [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];
}

// Diagonal quads use the same counter-clockwise winding as rectangles.
export function createDiagonalPolygon(ax, ay, bx, by, strokeWidth = 0.15) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);
  const nx = (-dy / len) * (strokeWidth / 2);
  const ny = (dx / len) * (strokeWidth / 2);

  return [
    [ax - nx, ay - ny],
    [bx - nx, by - ny],
    [bx + nx, by + ny],
    [ax + nx, ay + ny],
  ];
}
