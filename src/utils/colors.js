export const RAINBOW_PALETTE = ["#ff6d9a", "#f8b95c", "#73e6bb", "#72acff"];

export function hexToRgb(hexString) {
  const value = parseInt(hexString.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255.0,
    ((value >> 8) & 255) / 255.0,
    (value & 255) / 255.0,
  ];
}

export function mixRgb(colorA, colorB, factor) {
  return colorA.map(
    (channel, i) => channel * (1.0 - factor) + colorB[i] * factor,
  );
}
