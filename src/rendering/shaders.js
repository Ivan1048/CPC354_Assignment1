// Vertex Shader: Transforms 3D vertex positions and normals by MVP and Model matrices
export const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec3 aColor;

    uniform mat4 uMVP;
    uniform mat4 uModel;

    varying vec3 vNormal;
    varying vec3 vColor;

    void main() {
        gl_Position = uMVP * vec4(aPosition, 1.0);
        vNormal = mat3(uModel) * aNormal;
        vColor = aColor;
    }
`;

// Fragment Shader: Computes directional diffuse lighting and blends surface color
export const fragmentShaderSource = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vColor;

    uniform float uLighting;

    void main() {
        vec3 n = normalize(vNormal);
        vec3 lightDirection = normalize(vec3(-0.45, 0.75, 1.0));
        float diffuse = max(dot(n, lightDirection), 0.0);
        float brightness = mix(1.0, 0.34 + 0.66 * diffuse, uLighting);
        gl_FragColor = vec4(vColor * brightness, 1.0);
    }
`;
