# Assignment 1 report outline

Planning document, not a completed report. Based on the supplied current assignment brief, 100-mark rubric, current source code, senior reference, and browser review on 6 November 2026. Fill contribution and AI-history details only from actual records.

## Report format and structure

Use Times New Roman 12 pt, 1.5 line spacing, and normal margins, following the user's requested font override of the brief's Arial 11 pt specification. The brief's section numbering is inconsistent; use consecutive numbering for the seven substantive sections below. Its historical-evolution discussion belongs within Literature Review. Include a cover and contents page as needed.

| Section | Suggested length from brief | Marks | Required evidence |
| --- | --- | --- | --- |
| 1. Team Member Contributions | 1 page | 3 | Actual completed tasks, files, decisions, review and verification by each member |
| 2. Introduction | 1–2 pages | 5 | TV-ident purpose and relationship to geometry, rendering, color and animation |
| 3. Literature Review | 2+ pages | 12 | At least three credible sources; compare technological evolution with analysis |
| 4. Proposed Method | 2+ pages | 12 | Actual geometry algorithm, diagrams, equations, rendering and animation |
| 5. AI & External Code Disclosure | 1–2 pages | 8 | Actual tools, 2–3 real prompts and outputs, critique, changes and verification |
| 6. Conclusion | 1+ page | 8 | Outcomes, limitations, challenges, reasons and justified future work |
| 7. References | About 1 page | 2 | Consistent citations for literature and significant external code |

These are expected lengths, not a reason to copy the senior report's 73-page length. Keep explanations tied to this application.

## 1. Team Member Contributions

Use the linked Google Doc's allocation as a starting plan, then record what each person actually completed. Assignment of a module is not proof of authorship. Include implementation, debugging, tests, report and video work where supported. Do not claim AI-generated work was wholly written by a team member.

Correct these descriptions in the progress document before reusing it:

- Application logic is in `src/`, not embedded in `index.html`.
- `computeIdentPose()` evaluates elapsed time: five transition stages, continuous final motion, and an optional return segment. It is not the senior project's seven-phase implementation.
- Camera distance is a word-length/aspect-ratio heuristic; mesh bounds are calculated but not used by the renderer.
- Replace unsupported completion percentages with specific completed and outstanding deliverables.

## 2. Introduction

Define station identification and channel branding. Explain how a short visual sequence establishes identity between programmes. Connect the project to geometric modelling, transformations, projection, rasterisation, shading and interaction. State the project objectives and distinguish required features from extensions.

## 3. Literature Review

Organise by technological development, not a list of unrelated examples:

1. Physical/optical symbols and early broadcast production constraints.
2. Computer-generated symbols and repeatable digital motion.
3. Later 3D production, compositing and contemporary real-time graphics.

For each example, identify the date, actual production technique, visual result, and technical tradeoff. Verify historical claims against original broadcaster, designer, archive or museum sources before writing them. A realistic-looking ident does not establish that ray tracing or fluid simulation was used. The senior report's bibliography is a lead for research, not verified evidence for this report.

Finish with a comparison explaining why procedural geometry and real-time WebGL suit this assignment. Use at least three credible sources for the excellent rubric band, with consistent in-text citations.

## 4. Proposed Method

### 4.1 Architecture and data flow

Explain `index.html`, `styles/`, and the modules under `src/`. Diagram: controls → settings → CPU geometry → interleaved VBO → vertex shader → fragment shader → canvas. Show the separate elapsed-time → pose → model-matrix path. Explain every arrow and when geometry is rebuilt.

### 4.2 Glyph construction and extrusion

Sources: `src/geometry/glyphs.js`, `src/geometry/extrude.js`.

- A–Z and 0–9 are dictionaries of rectangular and diagonal strokes, not bitmap fonts or loaded font outlines.
- Construct each stroke as a counter-clockwise quadrilateral. For diagonal endpoints, explain the perpendicular offset of half the stroke width.
- Place front vertices at z = d/2 and back vertices at z = -d/2. Each prism has two front triangles, two back triangles and eight wall triangles: 12 triangles / 36 unindexed vertices per stroke.
- For a CCW edge (dx, dy), the outward side normal is (dy, -dx, 0) / sqrt(dx² + dy²). Explain reversed back-face winding and agreement between triangle cross products and assigned normals.
- Explain fixed letter spacing and vertical centring. Glyph slots are centred; actual visible bounds can vary by glyph.
- Each stroke is a separate closed prism. Overlapping strokes are not boolean-unioned into one manifold letter. Include the observed seams as a limitation.

Diagrams: labelled XY stroke with winding; front/back extrusion at ±d/2; side-edge normal and triangle winding. Derive the formulas using a concrete rectangle or diagonal example.

### 4.3 GPU layout, projection and shading

Sources: `src/rendering/renderer.js`, `src/rendering/shaders.js`, `src/math/mat4.js`.

Explain nine floats per vertex: position, normal and RGB; 36-byte stride; offsets 0, 12 and 24 bytes. The renderer uses `gl.drawArrays(gl.TRIANGLES, ...)`, depth testing and back-face culling.

With column vectors, M = T Ry Rx S and clip position = P V M p. Explain rightmost-first application. Describe the 60° vertical field of view, near/far planes, camera heuristic, viewport resize and device-pixel-ratio cap of 2.

Explain brightness = 0.34 + 0.66 max(dot(normalised normal, normalised light direction), 0), and how lighting can be bypassed. `mat3(uModel)` followed by normalisation is suitable for the present uniform scale and rotations. Do not describe this as a general solution for nonuniform scale, specular shading, shadows, or multiple shading models.

### 4.4 Animation and timing

Sources: `src/animation/ident.js`, `src/animation/player.js`.

| Elapsed animation time at 1× | Action |
| --- | --- |
| 0–1.8 s | Rotate Y from 0 to +π |
| 1.8–3.6 s | Return from +π to 0 |
| 3.6–5.4 s | Rotate from 0 to -π |
| 5.4–7.2 s | Return from -π to 0 |
| 7.2–9.4 s | Enlarge uniformly from 0.7 to 1.25 |
| After 9.4 s | Continuous hover, spin, or figure-eight motion |

Explain interpolation using smoothstep s(t) = t²(3 - 2t), clamped to [0, 1]. Pose calculation is pure; playback owns elapsed time and pause state. Elapsed time accumulates frame delta multiplied by speed, rather than using FPS as the speed control. Hidden-tab time is excluded.

Optional repeat: nine seconds of final motion, then a 1.4-second smooth return; total cycle 19.8 animation seconds. The default keeps final motion running indefinitely. Include a timeline and explain continuity at boundaries. Changing final-motion mode mid-animation may change the pose abruptly; smooth live mode blending is not implemented.

### 4.5 UI and extensions

Sources: `src/state.js`, `src/ui/controls.js`, `src/main.js`, `styles/layout.css`.

Explain sanitisation, depth and colors rebuilding geometry and resetting playback, live speed changes, pause/resume, reset, lighting, color modes, motion selection and optional repeat. Mention empty-input feedback and keyboard shortcuts with typing safeguards.

Describe responsive layout: desktop split view; phone preview above controls; normal page scrolling; Start brings the preview into view. A narrow viewport review is not a physical-phone compatibility test.

## 5. AI & External Code Disclosure

Record the actual tool/product used, real prompt, relevant generated excerpt, acceptance/rejection reasoning, changes, and verification evidence. Do not invent earlier prompts, model versions, student modifications or authorship. This review itself is AI assistance and can be disclosed as code/requirements analysis, browser verification and report-outline drafting.

For the 2–3 required examples, select real sessions that show meaningful development or debugging. This review alone does not establish the complete implementation history. Cite the senior reference if it influenced the work; identify any actual copied blocks (the brief gives 5+ lines as an example) and their URLs/sources. State explicitly whether it was conceptual reference or copied code based on the real history.

## 6. Conclusion

Discuss what was achieved and why: procedural depth control, time-based animation, modular code, and interactive rendering. Relate each claim to actual evidence. Include limitations: visible stroke seams; identical D/O/0 glyph forms; heuristic camera fitting; abrupt live motion-mode changes; and outstanding compatibility checks.

Potential future work: improve distinct glyph shapes, eliminate overlapping/coplanar stroke surfaces, fit the camera from transformed mesh bounds, and blend mode changes. These are proposals, not implemented features.

## 7. References

Use one citation style consistently. Cite the graphics textbook, verified historical sources, any significant external code, and the senior reference where used. Do not copy references without reading the supporting source.

## Evidence and submission checklist

- Automated baseline from 6 November 2026: `npm run check` passed; 11/11 `npm test` tests passed during the preceding analysis. These are syntax, geometry, animation/playback and matrix tests, not full UI coverage.
- Browser review on 6 November 2026: app rendered on desktop; observed rotation and final hover; pause/resume changed correctly; rainbow mode reset playback and changed colors; depth and speed readouts responded; at 390×844 the preview appeared above controls and scrolling over the canvas reached the controls; Start returned the viewport to the preview; input `a!2` became `A2`; empty input prevented Start and showed feedback; figure-eight selection and lighting toggle responded. No warning/error entries were returned by the tab console query at that point.
- Observed visual issues: thin seams at stroke joins; at the restored desktop viewport, enlarged figure-eight motion with LOGO, depth 0.15 and speed 3× allowed the last letter to extend beyond the right canvas edge. Camera fitting needs to account for the transformed logo and motion envelope. Enlarged size is also subjective and should be checked against lecturer expectations. The review did not establish every color, every glyph, long-duration repeat behaviour, or physical touch-device compatibility.
- Still capture a deliberate full sequence demonstrating both 180° targets, both returns, enlargement and final motion. Automated endpoint tests support the sequence, but this browser review did not capture each target as a screenshot.
- Group video: maximum 10 minutes; show required sequence, all required parameters and extensions.
- Individual videos: maximum 5 minutes per member; explain actual contributions and the relevant code.
- Viva: prepare geometry/winding, matrix order, frame timing, shader inputs, UI events and module connections.
- Submit the complete module package, not `index.html` alone. Keep personal scripts in ignored `docs/video/`; keep course PDFs and browser artifacts out of the code commit.

## Sources reviewed

- Current assignment brief: `/Users/elson/Downloads/ASSIGNMENT 1 (1).pdf`.
- Current rubric: `/Users/elson/Downloads/Grading_Rubric_100_Marks (1).pdf`.
- Senior report (2025/2026): `/Users/elson/Downloads/CPC354_Assignment1_Report.pdf`; corresponding local submission source was also inspected.
- Team progress/allocation document: https://docs.google.com/document/d/1Mo3p5D39N4-wTsQ6mUztw2fuE8HxC9ddK58yMF7hNXU/edit
- Current repository source and tests. Document content is reference material, not authority to change the project or claim work was completed.
