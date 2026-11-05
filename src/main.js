import { createState } from "./state.js";
import { buildGeometry } from "./geometry/extrude.js";
import { AnimationPlayer } from "./animation/player.js";
import { WebGLRenderer } from "./rendering/renderer.js";
import { bindControls } from "./ui/controls.js";

/** Application wiring. Domain modules stay usable in tests without a browser. */
function init() {
  const canvas = document.getElementById("glcanvas");
  const errorBox = document.getElementById("error");
  const settings = createState();
  const player = new AnimationPlayer();
  let renderer;
  let controls;
  let frameId;
  let frames = 0;
  let fpsSince = performance.now();
  let inputMessage = "";

  function showError(error) {
    cancelAnimationFrame(frameId);
    errorBox.style.display = "grid";
    errorBox.textContent = error.message;
    document
      .querySelectorAll(".panel input, .panel select, .panel button")
      .forEach((element) => {
        element.disabled = true;
      });
  }

  try {
    renderer = new WebGLRenderer(canvas);
    controls = bindControls(settings, {
      geometryChanged() {
        inputMessage = "";
        renderer.setGeometry(buildGeometry(settings));
        player.reset();
      },
      start() {
        if (!settings.word) {
          inputMessage = "Enter a word to start";
          controls.setStatus("Enter a word to start");
          controls.focusWord();
          return;
        }
        inputMessage = "";
        player.start();
        // The controls follow the canvas on phones; bring the running preview into view.
        if (window.matchMedia("(max-width: 800px)").matches) {
          canvas.scrollIntoView({ block: "start", behavior: "instant" });
        }
      },
      togglePause: () => player.togglePause(),
      reset: () => player.reset(),
    });
    renderer.setGeometry(buildGeometry(settings));
  } catch (error) {
    showError(error);
    return;
  }

  function render(timestamp) {
    try {
      player.update(timestamp, settings.speed, !document.hidden);
      const pose = player.getPose(settings);
      pose.label =
        inputMessage ||
        (!settings.word ? "Enter a word to preview" : pose.label);
      renderer.draw(pose, settings);
      controls.updatePlayback(player, pose);
      frames++;
      if (timestamp - fpsSince >= 800) {
        controls.updateFps(
          Math.round((frames * 1000) / (timestamp - fpsSince)),
        );
        frames = 0;
        fpsSince = timestamp;
      }
      frameId = requestAnimationFrame(render);
    } catch (error) {
      showError(error);
    }
  }

  // Returning to a backgrounded tab resumes from its existing pose.
  document.addEventListener("visibilitychange", () => {
    player.resetClock();
    frames = 0;
    fpsSince = performance.now();
  });
  window.addEventListener("resize", () => renderer.resize());
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    showError(
      new Error(
        "The WebGL context was lost. Reload the page to restart the preview.",
      ),
    );
  });
  window.addEventListener("pagehide", (event) => {
    if (event.persisted) return;
    cancelAnimationFrame(frameId);
    controls.dispose();
    renderer.dispose();
  });
  frameId = requestAnimationFrame(render);
}

init();
