# AI assistance during repository setup and refactoring

This is a factual record of this Codex session on 5 November 2026. It supports the mandatory disclosure section; it does not establish the authorship or AI history of the original downloaded HTML. The team must add that earlier history and describe its own work accurately in the final report.

## Requests in this session

1. The user requested a comparison of their downloaded `index.html` against the senior report, Drive source files, assignment brief, and rubric.
2. After that review, the user supplied `https://github.com/Ivan1048/CPC354_Assignment1.git` and requested: “modularise the components out and sort accordingly for me. U may address those concerns which u have raised up as well”.

These are the actual request contexts for this work. The final report should include the actual prompts and outputs required by the brief, including any earlier AI sessions; do not invent additional examples.

## Code and documentation assisted by Codex

- Extracted the supplied HTML into semantic markup, three stylesheets, and native JavaScript modules for settings, geometry, matrix math, animation, rendering, and UI bindings.
- Reused the original glyph definitions, extrusion approach, matrix operations, shader logic, and visual styling as the starting implementation.
- Corrected diagonal polygon winding so its normals point outward consistently.
- Added a smooth return for optional full repeats and removed the figure-eight entry tilt jump.
- Changed mobile layout to show the preview first and permit document scrolling.
- Separated playback timing and addressed speed integration, paused/hidden time, and native button keyboard behavior.
- Added local development commands, regression tests, CI configuration, and architecture documentation.

## Verification and student responsibility

Automated tests cover all supported glyphs and their winding/normals, depth and colors, required animation endpoints, repeat continuity, playback timing, and matrix conventions. Browser checks complement those tests for controls, rendering, and mobile layout. Consult the PR validation notes for the checks actually completed.

The team should inspect, run, and understand the assisted changes before claiming contributions. In particular, explain why counter-clockwise winding determines the side normal, why transformation multiplication order matters, how elapsed time is integrated, and how repeat-boundary orientations can differ by a full turn while rendering identically.

The senior project was read as a comparison reference:

- Source folder: https://drive.google.com/drive/folders/1tyY5bZXzPfpDwVGnPRze6c8csF58xl7b
- Senior JavaScript: https://drive.google.com/file/d/1q9cbCbptFuEJZb3o2qpWXrnDltytvTKv/view

The code was extracted from the user's supplied HTML; the senior implementation was not imported into this repository. List any significant external code used before this session separately, with source URLs. This repository does not bundle the senior report, code, or lecture helper library.
