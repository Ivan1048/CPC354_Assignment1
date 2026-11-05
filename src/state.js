/** Shared settings, independent of the DOM and WebGL. */
export const DEFAULT_SETTINGS = Object.freeze({
  word: "LOGO",
  depth: 0.45,
  speed: 1,
  front: "#6ddcf7",
  side: "#745bfa",
  colorMode: "dual",
  motion: "hover",
  lighting: true,
  autoLoop: false,
});

export function createState() {
  return { ...DEFAULT_SETTINGS };
}

export function sanitizeWord(value) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
}
