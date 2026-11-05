import test from "node:test";
import assert from "node:assert/strict";
import {
  createTranslationMatrix,
  createScaleMatrix,
  createRotationYMatrix,
  createPerspectiveMatrix,
  multiplyMatrices,
} from "../src/math/mat4.js";

test("column-major composition applies scale then rotation then translation", () => {
  const model = multiplyMatrices(
    createTranslationMatrix(2, 3, 4),
    multiplyMatrices(createRotationYMatrix(Math.PI / 2), createScaleMatrix(2)),
  );
  const point = [1, 0, 0, 1];
  const transformed = [0, 1, 2, 3].map((row) =>
    point.reduce((sum, value, col) => sum + model[col * 4 + row] * value, 0),
  );
  for (const [axis, expected] of [2, 3, 2, 1].entries()) {
    assert.ok(Math.abs(transformed[axis] - expected) < 1e-6);
  }
});

test("perspective projection maps the near and far planes to the WebGL clip range", () => {
  const projection = createPerspectiveMatrix(Math.PI / 3, 1.5, 0.1, 100);
  for (const [z, expected] of [
    [-0.1, -1],
    [-100, 1],
  ]) {
    const projectedZ = (projection[10] * z + projection[14]) / -z;
    assert.ok(Math.abs(projectedZ - expected) < 1e-6);
  }
});
