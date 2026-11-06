import test from "node:test";
import assert from "node:assert/strict";
import { buildGeometry, FLOATS_PER_VERTEX } from "../src/geometry/extrude.js";
import { GLYPH_MAP } from "../src/geometry/glyphs.js";
import { createState, sanitizeWord } from "../src/state.js";

test("all 36 glyphs produce finite union meshes whose triangle winding agrees with their normals", () => {
  assert.equal(Object.keys(GLYPH_MAP).length, 36);
  for (const word of Object.keys(GLYPH_MAP)) {
    const { vertices, vertexCount } = buildGeometry({ ...createState(), word });
    assert.ok(vertexCount > 0 && vertexCount % 3 === 0);
    assert.ok(vertices.every(Number.isFinite), `${word}: finite vertices`);
    for (
      let offset = 0;
      offset < vertices.length;
      offset += 3 * FLOATS_PER_VERTEX
    ) {
      const point = (index) =>
        Array.from(vertices.slice(offset + index * 9, offset + index * 9 + 3));
      const [a, b, c] = [point(0), point(1), point(2)];
      const u = b.map((value, axis) => value - a[axis]);
      const v = c.map((value, axis) => value - a[axis]);
      const cross = [
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0],
      ];
      const normal = Array.from(vertices.slice(offset + 3, offset + 6));
      const dot = cross.reduce(
        (sum, value, axis) => sum + value * normal[axis],
        0,
      );
      assert.ok(dot > 0, `${word}: triangle ${offset / 27} points outward`);
      assert.ok(
        Math.abs(Math.hypot(...normal) - 1) < 1e-6,
        `${word}: unit normal`,
      );
    }
  }
});

test("extrusion changes the Z thickness without changing X/Y geometry", () => {
  const thin = buildGeometry({ ...createState(), word: "KMXZ", depth: 0.1 });
  const thick = buildGeometry({ ...createState(), word: "KMXZ", depth: 1.2 });
  assert.deepEqual(thin.bounds.min.slice(0, 2), thick.bounds.min.slice(0, 2));
  assert.deepEqual(thin.bounds.max.slice(0, 2), thick.bounds.max.slice(0, 2));
  assert.ok(Math.abs(thick.bounds.min[2] + 0.6) < 1e-6);
  assert.ok(Math.abs(thick.bounds.max[2] - 0.6) < 1e-6);
});

test("dual, single, and rainbow modes assign the intended vertex colors", () => {
  const settings = {
    ...createState(),
    word: "LL",
    front: "#ff0000",
    side: "#00ff00",
  };
  const dual = buildGeometry(settings).vertices;
  assert.deepEqual(Array.from(dual.slice(6, 9)), [1, 0, 0]);
  assert.deepEqual(Array.from(dual.slice(3 * 9 + 6, 3 * 9 + 9)), [0, 1, 0]);
  const single = buildGeometry({ ...settings, colorMode: "single" }).vertices;
  for (let offset = 6; offset < single.length; offset += 9) {
    assert.deepEqual(Array.from(single.slice(offset, offset + 3)), [1, 0, 0]);
  }
  const rainbow = buildGeometry({ ...settings, colorMode: "rainbow" }).vertices;
  const secondLetter = buildGeometry({ ...settings, word: "L" }).vertices.length;
  assert.notDeepEqual(
    Array.from(rainbow.slice(6, 9)),
    Array.from(rainbow.slice(secondLetter + 6, secondLetter + 9)),
  );
});

test("empty input clears geometry and unsupported input cannot silently produce a partial logo", () => {
  const empty = buildGeometry({ ...createState(), word: "" });
  assert.equal(empty.vertexCount, 0);
  assert.deepEqual(empty.bounds, { min: [0, 0, 0], max: [0, 0, 0] });
  assert.throws(
    () => buildGeometry({ ...createState(), word: "?" }),
    /Unsupported character/,
  );
  assert.equal(sanitizeWord("a!b-34z"), "AB34");
});

test('D, O and zero have distinct geometry', () => {
  const meshes = ['D','O','0'].map(word=>buildGeometry({...createState(),word}).vertices);
  assert.notDeepEqual(meshes[0],meshes[1]);
  assert.notDeepEqual(meshes[1],meshes[2]);
});
