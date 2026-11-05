import { sanitizeWord } from "../state.js";

/** DOM bindings only. Geometry, GPU work, and playback are supplied as callbacks. */
export function bindControls(settings, actions, root = document) {
  const ids = [
    "word",
    "depth",
    "frontColor",
    "sideColor",
    "colorMode",
    "speed",
    "motion",
    "lighting",
    "autoLoop",
    "play",
    "pause",
    "reset",
    "depthValue",
    "speedValue",
    "status",
    "fps",
  ];
  const elements = Object.fromEntries(
    ids.map((id) => [id, root.getElementById(id)]),
  );
  const controller = new AbortController();
  const listen = (element, event, callback) =>
    element.addEventListener(event, callback, {
      signal: controller.signal,
    });

  for (const id of ["word", "depth", "speed", "motion", "colorMode"]) {
    elements[id].value = settings[id];
  }
  elements.frontColor.value = settings.front;
  elements.sideColor.value = settings.side;
  elements.lighting.checked = settings.lighting;
  elements.autoLoop.checked = settings.autoLoop;

  function updateReadouts() {
    elements.depthValue.textContent = settings.depth.toFixed(2);
    elements.speedValue.textContent = `${settings.speed.toFixed(2)}×`;
  }

  for (const id of ["word", "depth", "frontColor", "sideColor", "colorMode"]) {
    listen(elements[id], "input", () => {
      settings.word = sanitizeWord(elements.word.value);
      elements.word.value = settings.word;
      settings.depth = Number(elements.depth.value);
      settings.front = elements.frontColor.value;
      settings.side = elements.sideColor.value;
      settings.colorMode = elements.colorMode.value;
      updateReadouts();
      actions.geometryChanged();
    });
  }

  listen(elements.speed, "input", () => {
    settings.speed = Number(elements.speed.value);
    updateReadouts();
  });
  listen(elements.motion, "change", () => {
    settings.motion = elements.motion.value;
  });
  listen(elements.lighting, "change", () => {
    settings.lighting = elements.lighting.checked;
  });
  listen(elements.autoLoop, "change", () => {
    settings.autoLoop = elements.autoLoop.checked;
  });
  listen(elements.play, "click", actions.start);
  listen(elements.pause, "click", actions.togglePause);
  listen(elements.reset, "click", actions.reset);

  listen(root, "keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target.closest?.('input, select, textarea, [contenteditable="true"]'))
      return;
    // Let native buttons handle Space/Enter so one key cannot trigger two actions.
    if (
      target.closest?.("button, a") &&
      ["Space", "Enter"].includes(event.code)
    )
      return;
    if (event.repeat) return;
    if (event.code === "Space") {
      event.preventDefault();
      actions.togglePause();
    } else if (event.key.toLowerCase() === "r") {
      actions.reset();
    } else if (event.key === "Enter") {
      actions.start();
    }
  });

  function setStatus(message) {
    // Avoid rewriting the live region on every animation frame.
    if (elements.status.textContent !== message)
      elements.status.textContent = message;
  }

  updateReadouts();
  return {
    setStatus,
    focusWord: () => elements.word.focus(),
    updatePlayback(player, pose) {
      elements.pause.disabled = player.phase !== "playing";
      elements.pause.textContent = player.paused ? "Resume" : "Pause";
      setStatus(player.paused ? "Paused" : pose.label);
    },
    updateFps: (fps) => {
      elements.fps.textContent = `${fps} FPS`;
    },
    dispose: () => controller.abort(),
  };
}
