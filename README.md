# CPC354 Assignment 1: 3D TV Ident Studio

A procedural 3D word logo built with WebGL and native JavaScript modules. Letters are assembled from manually defined 2D strokes and extruded into triangle meshes. This repository is the working source for the project.

## Run locally

Install Node.js 22 or newer, then run from the repository root:

```sh
npm run dev
```

Open **http://127.0.0.1:5173**. The project has no npm dependencies, so installing packages is optional. Stop the server with Ctrl+C. Set the `PORT` environment variable to use another port.

Serve the app over HTTP: opening `index.html` through `file://` blocks JavaScript module imports in browsers. Any static HTTP server can serve the repository; no build step is required. Relative asset paths also support hosting in a subdirectory.

## Project structure

```text
index.html                 Semantic app shell and control markup
styles/
  base.css                 Theme tokens and document defaults
  controls.css             Inputs, buttons, focus states, shortcuts
  layout.css               Desktop layout, canvas overlays, mobile layout
src/
  main.js                  Application startup and module wiring
  state.js                 Default settings and word sanitization
  geometry/
    glyphs.js              A–Z / 0–9 strokes and counter-clockwise polygons
    extrude.js             Pure CPU mesh generation and mesh bounds
    union.js               Stroke union faces and exposed boundary edges
  math/
    mat4.js                Column-major 4×4 matrix operations
    camera.js              Bounds-based camera fitting for the motion envelope
  animation/
    ident.js               Pure animation timeline and final motion paths
    player.js              Start, pause, reset, and elapsed-time integration
  rendering/
    shaders.js             GLSL vertex and fragment shaders
    renderer.js            GPU buffers, camera, viewport, and drawing
  ui/
    controls.js            DOM events and control-panel feedback
  utils/
    colors.js              Color conversion, interpolation, rainbow palette
scripts/
  serve.mjs                Local static server
  check.mjs                JavaScript syntax checks
tests/                     Geometry, animation, playback, and matrix regression tests
```

## Controls and animation

- Enter 1–4 letters or digits. The initial word is `LOGO`.
- Configure extrusion depth and front/side colors before starting. Geometry or color changes reset playback.
- Choose dual, single, or per-letter rainbow colors; toggle directional lighting.
- Start the sequence: rotate right 180°, return, rotate left 180°, return, enlarge, then move continuously.
- Select hover, continuous spin, or figure-eight drift for the final motion. Live motion and repeat-setting changes blend over 0.65 animation seconds, including interrupted changes. Spin targets are unwrapped during blending to avoid a flip at the half-turn boundary.
- Stroke faces are partitioned into non-overlapping pieces, and only exposed union boundaries are extruded. Vertical stroke joins overlap to avoid gaps; D has chamfered right corners and zero has a slash.
- The camera fits a sphere around the actual mesh bounds at hero scale, plus the final-motion translation envelope. Its distance stays fixed during playback so enlargement remains visible without camera pumping.
- Change playback speed while running. Pause/resume preserves the current pose; Reset returns to the initial pose without restoring all settings.
- Full-sequence repeat is optional and initially off. When enabled, nine seconds of final motion are followed by a smooth 1.4-second return before the sequence repeats.
- Keyboard shortcuts: Enter starts, Space pauses/resumes, R resets. Inputs retain their normal typing behavior; focused buttons retain native Enter/Space activation.

On phones, the canvas appears above the controls and the document scrolls normally, including swipes over the canvas. Starting the animation brings its preview into view. Desktop keeps the original split view.

## Check changes

```sh
npm run check
npm test
```

The tests check all 36 glyphs, outward normals and triangle winding, extrusion thickness, color modes, animation boundaries, smooth repeat transitions, playback timing, and matrix composition. GitHub Actions runs the same checks for pushes and pull requests.

## Assignment notes

The implementation follows the supplied assignment brief and rubric. The brief allows a well-structured `.js` / `.html` package. The report, videos, and individual viva are separate deliverables.

The senior project was reviewed as a reference; its bitmap-cube method is different from this project's stroke extrusion. Describe the actual algorithms here in the report. The supplied brief does not explicitly require the senior project's `Common` helper library; follow any additional lecturer instruction if one exists.

The course PDFs and earlier local review artifacts stay in the workspace and are ignored by Git. Include the required AI and external-code disclosure in the written report.
