const VERTEX_SHADER = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

uniform sampler2D u_map;
uniform vec2 u_resolution;
uniform float u_lon;
uniform float u_lat;
uniform float u_fov;

const float PI = 3.14159265359;

vec2 directionToEquirect(vec3 dir) {
  return vec2(
    atan(dir.z, dir.x) / (2.0 * PI) + 0.5,
    asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5
  );
}

mat3 rotationMatrix(float lonRad, float latRad) {
  float phi = (PI * 0.5) - latRad;
  float theta = lonRad;

  vec3 forward = vec3(
    sin(phi) * cos(theta),
    cos(phi),
    sin(phi) * sin(theta)
  );

  vec3 worldUp = vec3(0.0, 1.0, 0.0);
  vec3 right = normalize(cross(worldUp, forward));
  vec3 up = cross(forward, right);

  return mat3(right, up, forward);
}

void main() {
  vec2 ndc = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;
  float aspect = u_resolution.x / u_resolution.y;
  float tanHalfFov = tan(u_fov * 0.5);
  vec3 rayCamera = normalize(vec3(ndc.x * aspect * tanHalfFov, -ndc.y * tanHalfFov, 1.0));

  float lonRad = u_lon * PI / 180.0;
  float latRad = u_lat * PI / 180.0;
  mat3 rot = rotationMatrix(lonRad, latRad);

  vec3 direction = normalize(rot * rayCamera);
  gl_FragColor = texture2D(u_map, directionToEquirect(direction));
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'Unknown shader error';
    gl.deleteShader(shader);
    throw new Error(log);
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create WebGL program');

  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? 'Unknown link error';
    gl.deleteProgram(program);
    throw new Error(log);
  }

  return program;
}

export type EquirectPanoramaView = {
  lon: number;
  lat: number;
};

export class EquirectPanoramaViewer {
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture | null = null;
  private buffer: WebGLBuffer;
  private positionLocation: number;
  private mapLocation: WebGLUniformLocation;
  private resolutionLocation: WebGLUniformLocation;
  private lonLocation: WebGLUniformLocation;
  private latLocation: WebGLUniformLocation;
  private fovLocation: WebGLUniformLocation;
  private view: EquirectPanoramaView;
  private fovRadians: number;
  private disposed = false;

  constructor(
    private canvas: HTMLCanvasElement,
    options?: { initialLon?: number; initialLat?: number; fovDegrees?: number },
  ) {
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: true,
      premultipliedAlpha: false,
    });

    if (!gl) throw new Error('WebGL is not available');

    this.gl = gl;
    this.program = createProgram(gl);
    this.buffer = this.createFullscreenBuffer();
    this.positionLocation = gl.getAttribLocation(this.program, 'a_position');
    this.mapLocation = gl.getUniformLocation(this.program, 'u_map')!;
    this.resolutionLocation = gl.getUniformLocation(this.program, 'u_resolution')!;
    this.lonLocation = gl.getUniformLocation(this.program, 'u_lon')!;
    this.latLocation = gl.getUniformLocation(this.program, 'u_lat')!;
    this.fovLocation = gl.getUniformLocation(this.program, 'u_fov')!;
    this.view = {
      lon: options?.initialLon ?? 0,
      lat: options?.initialLat ?? 0,
    };
    this.fovRadians = ((options?.fovDegrees ?? 75) * Math.PI) / 180;
  }

  private createFullscreenBuffer(): WebGLBuffer {
    const { gl } = this;
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Failed to create buffer');

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    return buffer;
  }

  async loadImage(url: string): Promise<void> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load panorama: ${url}`));
      img.src = url;
    });

    if (this.disposed) return;

    const { gl } = this;
    const isPowerOfTwo =
      (image.width & (image.width - 1)) === 0 && (image.height & (image.height - 1)) === 0;

    const texture = gl.createTexture();
    if (!texture) throw new Error('Failed to create texture');

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (isPowerOfTwo) {
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (this.texture) gl.deleteTexture(this.texture);
    this.texture = texture;
    this.render();
  }

  setView(view: Partial<EquirectPanoramaView>): void {
    if (view.lon !== undefined) this.view.lon = view.lon;
    if (view.lat !== undefined) this.view.lat = view.lat;
    this.render();
  }

  getView(): EquirectPanoramaView {
    return { ...this.view };
  }

  resize(): void {
    const { canvas, gl } = this;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    this.render();
  }

  render(): void {
    if (this.disposed || !this.texture) return;

    const { gl, program, buffer, canvas } = this;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(this.positionLocation);
    gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.mapLocation, 0);
    gl.uniform2f(this.resolutionLocation, canvas.width, canvas.height);
    gl.uniform1f(this.lonLocation, this.view.lon);
    gl.uniform1f(this.latLocation, this.view.lat);
    gl.uniform1f(this.fovLocation, this.fovRadians);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;

    const { gl } = this;
    if (this.texture) gl.deleteTexture(this.texture);
    gl.deleteBuffer(this.buffer);
    gl.deleteProgram(this.program);
  }
}
