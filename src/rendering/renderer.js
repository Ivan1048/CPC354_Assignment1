import { STRIDE_BYTES } from "../geometry/extrude.js";
import {
  createPerspectiveMatrix,
  createRotationXMatrix,
  createRotationYMatrix,
  createScaleMatrix,
  createTranslationMatrix,
  multiplyMatrices,
} from "../math/mat4.js";
import { vertexShaderSource, fragmentShaderSource } from "./shaders.js";

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${message}`);
  }
  return shader;
}

function createProgram(gl) {
  const program = gl.createProgram();
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Shader linking failed: ${message}`);
  }
  return program;
}

/** Owns the GPU resources, viewport, camera, and draw calls. */
export class WebGLRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false });
    if (!gl) {
      throw new Error(
        "WebGL is unavailable. Enable hardware acceleration or use a WebGL-capable browser.",
      );
    }
    this.gl = gl;
    this.program = createProgram(gl);
    this.buffer = gl.createBuffer();
    this.vertexCount = 0;
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

    for (const [name, offset] of [
      ["aPosition", 0],
      ["aNormal", 12],
      ["aColor", 24],
    ]) {
      const location = gl.getAttribLocation(this.program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(
        location,
        3,
        gl.FLOAT,
        false,
        STRIDE_BYTES,
        offset,
      );
    }
    this.uniforms = {
      mvp: gl.getUniformLocation(this.program, "uMVP"),
      model: gl.getUniformLocation(this.program, "uModel"),
      lighting: gl.getUniformLocation(this.program, "uLighting"),
    };
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.clearColor(0.025, 0.042, 0.09, 1);
  }

  setGeometry(mesh) {
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      mesh.vertices,
      this.gl.STATIC_DRAW,
    );
    this.vertexCount = mesh.vertexCount;
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const height = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.gl.viewport(0, 0, width, height);
  }

  draw(pose, settings) {
    this.resize();
    const { gl, canvas } = this;
    const aspect = canvas.width / canvas.height;
    const wordWidth = Math.max(1, settings.word.length * 1.25 - 0.25);
    const cameraDistance = Math.max(
      5.8,
      (wordWidth * 1.25) / aspect,
      3 / aspect,
    );
    const projection = createPerspectiveMatrix(Math.PI / 3, aspect, 0.1, 100);
    const view = createTranslationMatrix(0, 0, -cameraDistance);

    // Rightmost operation acts first: scale, X/Y rotations, then translation.
    const model = multiplyMatrices(
      createTranslationMatrix(pose.tx, pose.ty, 0),
      multiplyMatrices(
        createRotationYMatrix(pose.rotY),
        multiplyMatrices(
          createRotationXMatrix(pose.rotX),
          createScaleMatrix(pose.scale),
        ),
      ),
    );
    const mvp = multiplyMatrices(projection, multiplyMatrices(view, model));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(this.uniforms.mvp, false, mvp);
    gl.uniformMatrix4fv(this.uniforms.model, false, model);
    gl.uniform1f(this.uniforms.lighting, settings.lighting ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
  }

  dispose() {
    this.gl.deleteBuffer(this.buffer);
    this.gl.deleteProgram(this.program);
  }
}
