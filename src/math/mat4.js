// Column-major matrices; column vectors are transformed as M * v.
export function createIdentityMatrix() {
  return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
}

export function multiplyMatrices(matrixA, matrixB) {
  const result = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0.0;
      for (let k = 0; k < 4; k++) {
        sum += matrixA[k * 4 + row] * matrixB[col * 4 + k];
      }
      result[col * 4 + row] = sum;
    }
  }
  return result;
}

export function createTranslationMatrix(tx, ty, tz) {
  const m = createIdentityMatrix();
  m[12] = tx;
  m[13] = ty;
  m[14] = tz;
  return m;
}

export function createScaleMatrix(uniformScale) {
  const m = createIdentityMatrix();
  m[0] = uniformScale;
  m[5] = uniformScale;
  m[10] = uniformScale;
  return m;
}

export function createRotationYMatrix(angleRadians) {
  const m = createIdentityMatrix();
  const cosA = Math.cos(angleRadians);
  const sinA = Math.sin(angleRadians);
  m[0] = cosA;
  m[2] = -sinA;
  m[8] = sinA;
  m[10] = cosA;
  return m;
}

export function createRotationXMatrix(angleRadians) {
  const m = createIdentityMatrix();
  const cosA = Math.cos(angleRadians);
  const sinA = Math.sin(angleRadians);
  m[5] = cosA;
  m[6] = sinA;
  m[9] = -sinA;
  m[10] = cosA;
  return m;
}

export function createPerspectiveMatrix(
  fieldOfViewRadians,
  aspectRatio,
  nearPlane,
  farPlane,
) {
  const f = 1.0 / Math.tan(fieldOfViewRadians / 2.0);
  const m = new Float32Array(16);
  m[0] = f / aspectRatio;
  m[5] = f;
  m[10] = (farPlane + nearPlane) / (nearPlane - farPlane);
  m[11] = -1.0;
  m[14] = (2.0 * farPlane * nearPlane) / (nearPlane - farPlane);
  return m;
}
