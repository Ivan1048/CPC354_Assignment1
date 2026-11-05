# Project working instructions

- This repository is the canonical working source for CPC354 Assignment 1. Edit its files rather than the old standalone HTML in Downloads.
- Keep the application as native ES modules with plain WebGL unless the user explicitly requests a stack change.
- `index.html` contains semantic markup; styling belongs in `styles/`; application code belongs in the existing `src/` modules.
- Preserve the required right 180°, return, left 180°, return, enlarge, and continuous-motion sequence.
- Geometry and pose calculation should remain pure functions without DOM or WebGL dependencies.
- All stroke polygons must be counter-clockwise, and triangle winding must agree with outward normals.
- For geometry, animation, timing, or math changes, run `npm run check` and `npm test`. For UI changes, also inspect browser behavior and phone scrolling.
- Include actual AI assistance in the written report; do not invent team authorship, prompts, or verification results. Keep personal video scripts in `docs/video/` intact unless the user asks to edit them.
- Local course PDFs and review/browser artifacts are ignored. Do not publish them as part of unrelated code changes.
- See `README.md` for running the app and module responsibilities.
