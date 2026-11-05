# Architecture

## Data flow

`index.html` provides the controls and canvas. `main.js` creates a fresh settings object, an animation player, a renderer, and the UI bindings.

1. Geometry/color input changes update settings through `ui/controls.js`.
2. `geometry/extrude.js` generates a CPU mesh. `renderer.setGeometry()` uploads it to one vertex buffer, and playback resets.
3. Each animation frame updates the player's elapsed time using the current speed.
4. `animation/ident.js` computes a pose from elapsed time and motion settings.
5. The renderer combines that pose with view/projection matrices, uploads uniforms, and draws triangles.

Geometry and animation functions have no DOM or WebGL dependencies. Their inputs and results can be inspected directly in Node tests. The UI does not perform geometry calculations or GPU calls. `main.js` connects those responsibilities.

## Geometry generation

Each glyph maps to named rectangular or diagonal strokes in `glyphs.js`. Both polygon constructors return four counter-clockwise vertices. A diagonal uses a perpendicular offset from its centre line to give it a constant width.

For each stroke polygon and depth `d`:

- Front vertices use `z = d / 2`; back vertices use `z = -d / 2`.
- Each cap is split into two triangles, with reversed winding for the back cap.
- Four side quads connect corresponding front/back edges, each split into two triangles.
- A counter-clockwise edge `(dx, dy)` has outward side normal `(dy, -dx, 0) / length`.

That produces 12 triangles and 36 vertices per stroke. Each interleaved vertex stores nine floats: position XYZ, normal XYZ, and RGB color, giving a stride of 36 bytes. The default `LOGO` has 21 strokes and 756 vertices.

The geometry is a collection of overlapping closed stroke prisms, rather than a Boolean-unioned watertight mesh of each whole letter. This is appropriate for the current rasterized logo but matters if adding mesh export or geometric analysis later. Several segment-style glyphs share silhouettes, including D/O/0 and B/8.

## Transformations and lighting

Matrices are column-major and use column vectors. The model transform is:

```text
M = Translation × RotationY × RotationX × UniformScale
MVP = Perspective × View × M
```

The rightmost transform acts first. Rotations use radians. A perspective camera looks toward the origin from positive Z, and camera distance adapts to the word length and canvas aspect ratio.

The vertex shader transforms positions with MVP and normals with the model's upper 3×3 matrix. This normal transform is valid for the current rotation and uniform scaling because normals are normalized in the fragment shader. Introduce an inverse-transpose normal matrix if nonuniform scale is added.

The fragment shader combines a constant ambient term and directional Lambert diffuse lighting. Back-face culling is enabled because all triangle winding now agrees with the outward normals. Face colors are vertex data; animation and lighting changes only need uniform updates.

## Animation and timing

The compulsory stages last 1.8 seconds each for four rotations/returns, then 2.2 seconds for enlargement: 9.4 animation seconds in total. Cubic smoothstep eases each stage. Scale changes from 0.70 to 1.25.

By default, the final motion continues indefinitely at scale 1.25. Every final motion starts at the enlargement endpoint, including the figure-eight's X rotation.

Optional full repeats add nine seconds of final motion and a 1.4-second return. The return interpolates back to the initial scale, translation, and orientation. Spin returns to its nearest equivalent full turn, so it does not unwind all earlier turns. Tests compare rendered orientation using sine/cosine at the wrap boundary. Changing the motion or repeat setting during playback can select a different timeline pose immediately; configure these before starting for a consistent demonstration.

`AnimationPlayer` integrates `deltaTime × speed`. Visible slow frames retain real-time playback instead of being artificially slowed by a small delta clamp. Pause/resume resets the time origin, and hidden tabs suspend time advancement. This avoids catching up all hidden time on return.

## Extending the project

| Change                                   | Start here                                | Verification                                                        |
| ---------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| Glyph shape or a new stroke              | `src/geometry/glyphs.js`                  | Geometry winding/normal tests                                       |
| Extrusion or mesh layout                 | `src/geometry/extrude.js`                 | Geometry tests; update renderer attribute offsets if layout changes |
| Required stage durations or final motion | `src/animation/ident.js`                  | Animation endpoint and repeat tests                                 |
| Playback controls or timing              | `src/animation/player.js`                 | Pause, speed, and hidden-tab tests                                  |
| Camera or lighting                       | `src/rendering/renderer.js`, `shaders.js` | Matrix tests and a browser rendering check                          |
| A control or shortcut                    | `src/ui/controls.js`, `index.html`        | Check typing, focused buttons, and normal page shortcuts            |
| Responsive layout                        | `styles/layout.css`                       | Check desktop, 800px breakpoint, and phone scrolling                |

## Submission and team work

Deploy or submit `index.html`, `styles/`, and `src/` together. Serve them over HTTP. Node is only needed for the included local server and checks; the application runs directly in a WebGL-capable browser.

Module boundaries provide useful work areas, but the team must record actual authorship and contributions. Do not assign authors merely from this folder structure. Each member should be able to trace their feature from its input through geometry/timing to rendering.
