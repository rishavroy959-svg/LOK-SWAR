/**
 * WebGL Fluid Interactive Animation Simulation
 * High-performance GPU Navier-Stokes fluid dynamics engine.
 * Generates colorful, glowing smoke and fluid trails following cursor, touches, and ambient flow.
 */

export class WebGLFluidSimulation {
  constructor(canvasId = 'webgl-fluid-canvas') {
    this.canvasId = canvasId;
    this.canvas = null;
    this.gl = null;
    this.ext = null;
    this.pointers = [];
    this.splatStack = [];
    this.lastTime = Date.now();
    this.colorTimer = 0;
    this.autoSplatTimer = 0;
    this.initialized = false;

    this.config = {
      SIM_RESOLUTION: 128,
      DYE_RESOLUTION: 512,
      DENSITY_DISSIPATION: 0.97,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE: 0.8,
      PRESSURE_ITERATIONS: 20,
      CURL: 35,
      SPLAT_RADIUS: 0.28,
      SPLAT_FORCE: 6000,
      SHADING: true,
      COLORFUL: true,
      COLOR_UPDATE_SPEED: 10,
      PAUSED: false,
      BACK_COLOR: { r: 0, g: 0, b: 0 },
      TRANSPARENT: true
    };
  }

  init() {
    if (this.initialized) return;

    let canvas = document.getElementById(this.canvasId);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = this.canvasId;
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '0';
      canvas.style.opacity = '0.75';
      canvas.style.transition = 'opacity 0.5s ease';
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    this.canvas = canvas;

    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    if (!gl) {
      console.warn("WebGL not supported for fluid simulation");
      return;
    }
    this.gl = gl;

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat ? halfFloat.HALF_FLOAT_OES : gl.FLOAT);
    let formatRGBA, formatRG, formatR;

    if (isWebGL2) {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    } else {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    this.ext = {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering
    };

    this.initShaders();
    this.initFramebuffers();
    this.initEventListeners();

    // Trigger initial burst of pleasant ambient fluid
    this.multipleSplats(parseInt(Math.random() * 3) + 4);

    this.initialized = true;
    this.animate();
  }

  getSupportedFormat(gl, internalFormat, format, type) {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case gl.R16F:
          return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        case gl.RG16F:
          return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    }
    return { internalFormat, format };
  }

  supportRenderTextureFormat(gl, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  initShaders() {
    const gl = this.gl;

    const baseVertexShader = `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;
      void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const clearShader = `
      precision mediump float;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;
      uniform float value;
      void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
      }
    `;

    const displayShaderSource = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main () {
        vec4 c = texture2D(uTexture, vUv);
        gl_FragColor = vec4(c.rgb, c.a * 0.85);
      }
    `;

    const splatShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;
      void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
      }
    `;

    const advectionShader = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uVelocity;
      uniform sampler2D uSource;
      uniform vec2 texelSize;
      uniform float dt;
      uniform float dissipation;
      void main () {
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
      }
    `;

    const divergenceShader = `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
      }
    `;

    const curlShader = `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
      }
    `;

    const vorticityShader = `
      precision highp float;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform sampler2D uVelocity;
      uniform sampler2D uCurl;
      uniform float curl;
      uniform float dt;
      void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, vUv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
      }
    `;

    const pressureShader = `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uDivergence;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
      }
    `;

    const gradientSubtractShader = `
      precision mediump float;
      varying highp vec2 vUv;
      varying highp vec2 vL;
      varying highp vec2 vR;
      varying highp vec2 vT;
      varying highp vec2 vB;
      uniform sampler2D uPressure;
      uniform sampler2D uVelocity;
      void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
      }
    `;

    this.programs = {
      clear: this.createProgram(baseVertexShader, clearShader),
      display: this.createProgram(baseVertexShader, displayShaderSource),
      splat: this.createProgram(baseVertexShader, splatShader),
      advection: this.createProgram(baseVertexShader, advectionShader),
      divergence: this.createProgram(baseVertexShader, divergenceShader),
      curl: this.createProgram(baseVertexShader, curlShader),
      vorticity: this.createProgram(baseVertexShader, vorticityShader),
      pressure: this.createProgram(baseVertexShader, pressureShader),
      gradientSubtract: this.createProgram(baseVertexShader, gradientSubtractShader)
    };

    // Quad geometry buffer
    this.quadBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  }

  createProgram(vertexShaderSource, fragmentShaderSource) {
    const gl = this.gl;
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return null;
    }

    const uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
      const name = gl.getActiveUniform(program, i).name;
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    return { program, uniforms };
  }

  compileShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }

  initFramebuffers() {
    const gl = this.gl;
    const simRes = this.getResolution(this.config.SIM_RESOLUTION);
    const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);

    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA;
    const rg = this.ext.formatRG;
    const r = this.ext.formatR;
    const filtering = this.ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    this.density = this.createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    this.velocity = this.createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    this.divergence = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.curl = this.createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    this.pressure = this.createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
  }

  getResolution(resolution) {
    const gl = this.gl;
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    if (gl.drawingBufferWidth > gl.drawingBufferHeight) return { width: max, height: min };
    else return { width: min, height: max };
  }

  createFBO(w, h, internalFormat, format, type, param) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach: (id) => {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      }
    };
  }

  createDoubleFBO(w, h, internalFormat, format, type, param) {
    let fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = this.createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w,
      height: h,
      texelSizeX: 1.0 / w,
      texelSizeY: 1.0 / h,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      }
    };
  }

  initEventListeners() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    const pointer = {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: [0.95, 0.55, 0.2]
    };
    this.pointers.push(pointer);

    window.addEventListener('mousemove', (e) => {
      pointer.moved = pointer.down;
      pointer.texcoordX = e.clientX / window.innerWidth;
      pointer.texcoordY = 1.0 - e.clientY / window.innerHeight;
      pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX) * 5.0;
      pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY) * 5.0;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.down = true;
      pointer.color = this.generateThemeColor();
    });

    window.addEventListener('mousedown', (e) => {
      pointer.down = true;
      pointer.texcoordX = e.clientX / window.innerWidth;
      pointer.texcoordY = 1.0 - e.clientY / window.innerHeight;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = this.generateThemeColor();
      this.splat(pointer.texcoordX, pointer.texcoordY, (Math.random() - 0.5) * 500, (Math.random() - 0.5) * 500, pointer.color);
    });

    window.addEventListener('touchstart', (e) => {
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        this.splat(
          t.clientX / window.innerWidth,
          1.0 - t.clientY / window.innerHeight,
          (Math.random() - 0.5) * 400,
          (Math.random() - 0.5) * 400,
          this.generateThemeColor()
        );
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const touches = e.targetTouches;
      for (let i = 0; i < touches.length; i++) {
        const t = touches[i];
        pointer.texcoordX = t.clientX / window.innerWidth;
        pointer.texcoordY = 1.0 - t.clientY / window.innerHeight;
        pointer.deltaX = (pointer.texcoordX - pointer.prevTexcoordX) * 4.0;
        pointer.deltaY = (pointer.texcoordY - pointer.prevTexcoordY) * 4.0;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.down = true;
        pointer.color = this.generateThemeColor();
      }
    }, { passive: true });
  }

  generateThemeColor() {
    const isNight = document.body.classList.contains('night-mode');
    this.colorTimer += 0.05;

    if (isNight) {
      // Glowing Warm Amber, Electric Cyan, and Emerald
      const colors = [
        [0.89, 0.53, 0.26], // Warm Amber #E28743
        [0.15, 0.75, 0.85], // Radiant Cyan #26C6DA
        [0.18, 0.72, 0.45], // Emerald #2ECC71
        [0.95, 0.65, 0.30]  // Golden Honey
      ];
      const idx = Math.floor(Math.abs(Math.sin(this.colorTimer)) * colors.length) % colors.length;
      return colors[idx];
    } else {
      // Botanical Sage, Golden Harvest, and Soft Teal
      const colors = [
        [0.13, 0.35, 0.28], // Botanical Sage #204639
        [0.78, 0.49, 0.20], // Harvest Amber #C87D32
        [0.16, 0.48, 0.53], // Deep Teal #2A7B88
        [0.32, 0.55, 0.45]  // Muted Sage #528B74
      ];
      const idx = Math.floor(Math.abs(Math.cos(this.colorTimer)) * colors.length) % colors.length;
      return colors[idx];
    }
  }

  splat(x, y, dx, dy, color) {
    const gl = this.gl;
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.useProgram(this.programs.splat);
    gl.uniform1i(this.programs.splat.uniforms.uTarget, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.splat.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(this.programs.splat.uniforms.point, x, y);
    gl.uniform3f(this.programs.splat.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(this.programs.splat.uniforms.radius, this.config.SPLAT_RADIUS / 100.0);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    gl.viewport(0, 0, this.density.width, this.density.height);
    gl.uniform1i(this.programs.splat.uniforms.uTarget, this.density.read.attach(0));
    gl.uniform3f(this.programs.splat.uniforms.color, color[0] * 0.8, color[1] * 0.8, color[2] * 0.8);
    this.blit(this.density.write.fbo);
    this.density.swap();
  }

  multipleSplats(amount) {
    for (let i = 0; i < amount; i++) {
      const color = this.generateThemeColor();
      const x = Math.random();
      const y = Math.random();
      const dx = 800 * (Math.random() - 0.5);
      const dy = 800 * (Math.random() - 0.5);
      this.splat(x, y, dx, dy, color);
    }
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.initFramebuffers();
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.resizeCanvas();

    const dt = Math.min((Date.now() - this.lastTime) / 1000, 0.016);
    this.lastTime = Date.now();

    // Auto-ambient fluid swirls when idle
    this.autoSplatTimer += dt;
    if (this.autoSplatTimer > 4.5) {
      this.autoSplatTimer = 0;
      this.splat(Math.random(), Math.random(), (Math.random() - 0.5) * 450, (Math.random() - 0.5) * 450, this.generateThemeColor());
    }

    this.pointers.forEach(p => {
      if (p.down) {
        p.moved = false;
        this.splat(p.texcoordX, p.texcoordY, p.deltaX * this.config.SPLAT_FORCE, p.deltaY * this.config.SPLAT_FORCE, p.color);
        p.deltaX *= 0.8;
        p.deltaY *= 0.8;
        if (Math.abs(p.deltaX) < 0.001 && Math.abs(p.deltaY) < 0.001) p.down = false;
      }
    });

    this.step(dt);
    this.render();
  }

  step(dt) {
    const gl = this.gl;

    // Curl
    gl.viewport(0, 0, this.curl.width, this.curl.height);
    this.useProgram(this.programs.curl);
    gl.uniform2f(this.programs.curl.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.curl.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.curl.fbo);

    // Vorticity
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.useProgram(this.programs.vorticity);
    gl.uniform2f(this.programs.vorticity.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.vorticity.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.vorticity.uniforms.uCurl, this.curl.attach(1));
    gl.uniform1f(this.programs.vorticity.uniforms.curl, this.config.CURL);
    gl.uniform1f(this.programs.vorticity.uniforms.dt, dt);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // Divergence
    gl.viewport(0, 0, this.divergence.width, this.divergence.height);
    this.useProgram(this.programs.divergence);
    gl.uniform2f(this.programs.divergence.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.divergence.uniforms.uVelocity, this.velocity.read.attach(0));
    this.blit(this.divergence.fbo);

    // Clear Pressure
    gl.viewport(0, 0, this.pressure.width, this.pressure.height);
    this.useProgram(this.programs.clear);
    gl.uniform1i(this.programs.clear.uniforms.uTexture, this.pressure.read.attach(0));
    gl.uniform1f(this.programs.clear.uniforms.value, this.config.PRESSURE);
    this.blit(this.pressure.write.fbo);
    this.pressure.swap();

    // Pressure Solver (Poisson Iterations)
    this.useProgram(this.programs.pressure);
    gl.uniform2f(this.programs.pressure.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.pressure.uniforms.uDivergence, this.divergence.attach(1));
    for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(this.programs.pressure.uniforms.uPressure, this.pressure.read.attach(0));
      this.blit(this.pressure.write.fbo);
      this.pressure.swap();
    }

    // Gradient Subtract
    gl.viewport(0, 0, this.velocity.width, this.velocity.height);
    this.useProgram(this.programs.gradientSubtract);
    gl.uniform2f(this.programs.gradientSubtract.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.gradientSubtract.uniforms.uPressure, this.pressure.read.attach(0));
    gl.uniform1i(this.programs.gradientSubtract.uniforms.uVelocity, this.velocity.read.attach(1));
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // Advection Velocity
    this.useProgram(this.programs.advection);
    gl.uniform2f(this.programs.advection.uniforms.texelSize, this.velocity.texelSizeX, this.velocity.texelSizeY);
    gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.advection.uniforms.uSource, this.velocity.read.attach(0));
    gl.uniform1f(this.programs.advection.uniforms.dt, dt);
    gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.VELOCITY_DISSIPATION);
    this.blit(this.velocity.write.fbo);
    this.velocity.swap();

    // Advection Density (Dye)
    gl.viewport(0, 0, this.density.width, this.density.height);
    gl.uniform2f(this.programs.advection.uniforms.texelSize, this.density.texelSizeX, this.density.texelSizeY);
    gl.uniform1i(this.programs.advection.uniforms.uVelocity, this.velocity.read.attach(0));
    gl.uniform1i(this.programs.advection.uniforms.uSource, this.density.read.attach(1));
    gl.uniform1f(this.programs.advection.uniforms.dissipation, this.config.DENSITY_DISSIPATION);
    this.blit(this.density.write.fbo);
    this.density.swap();
  }

  render() {
    const gl = this.gl;
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    this.useProgram(this.programs.display);
    gl.uniform1i(this.programs.display.uniforms.uTexture, this.density.read.attach(0));
    this.blit(null);
  }

  useProgram(programObj) {
    this.gl.useProgram(programObj.program);
  }

  blit(target) {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quadBuffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }
}
