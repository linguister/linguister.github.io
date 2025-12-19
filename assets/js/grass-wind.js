// ============================================
// GRASS-IN-WIND VECTOR FIELD BACKGROUND MODULE
// Renders animated grass blades responding to wind forces
// ============================================

// ============================================
// TUNABLE DEFAULTS - Modify these for easy customization
// ============================================

const DEFAULTS = {
  // Grid Layout
  gridColumnsDesktop: 30,       // Number of grid columns for desktop (horizontal divisions)
  gridColumnsMobile: 10,        // Number of grid columns for mobile (horizontal divisions)
  mobileBreakpoint: 768,        // Screen width threshold for mobile (pixels)
  bladesPerCell: 1,             // Number of blades per grid cell

  // Appearance
  bladeLength: { min: 8, max: 20 },  // Blade length range in pixels
  bladeWidth: 1.5,              // Blade stroke width
  bladeAlpha: 0.4,              // Blade opacity (0-1)
  rootSize: 1.5,                // Root dot radius
  rootAlpha: 0.3,               // Root dot opacity (0-1)

  // Colors (CSS color strings)
  bladeColor: 'rgb(91, 111, 163)',     // Blade color (default: cuchilleras-primary)
  rootColor: 'rgb(91, 111, 163)',      // Root color (default: cuchilleras-primary)

  // Physics - Spring Model
  stiffness: 0.015,             // Spring stiffness (higher = faster response to wind)
  damping: 0.85,                // Damping factor (0-1, higher = more damping)
  maxBend: Math.PI * 2,       // Maximum bend angle (radians)

  // Base Wind Field
  fieldScale: 0.003,            // Spatial scale of noise field
  fieldStrength: 0.15,          // Base wind force multiplier
  fieldSpeed: 1,           // Time evolution speed

  // Gusts
  gustFrequency: 0.2,         // Probability of new gust per frame
  gustStrength: 0.8,            // Gust force multiplier
  gustRadius: 200,              // Gust influence radius (pixels)
  gustDuration: 3000,           // Gust lifetime (milliseconds)

  // Mouse Interaction
  mouseStrength: 0.5,           // Mouse wind force multiplier
  mouseRadius: 150,             // Mouse influence radius (pixels)
  mouseSmoothing: 0.15,         // Mouse velocity smoothing (0-1, lower = more smoothing)

  // Performance
  reducedMotion: false,         // Auto-detected from prefers-reduced-motion
  reducedMotionFPS: 5           // FPS when reduced motion is preferred
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Simple 2D Perlin-like noise using sine waves (lightweight alternative)
function noise2D(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

// Smooth noise interpolation
function smoothNoise(x, y, scale, seed) {
  const sx = x * scale;
  const sy = y * scale;
  const x0 = Math.floor(sx);
  const y0 = Math.floor(sy);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const fx = sx - x0;
  const fy = sy - y0;

  // Smoothstep interpolation
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const n00 = noise2D(x0, y0, seed);
  const n10 = noise2D(x1, y0, seed);
  const n01 = noise2D(x0, y1, seed);
  const n11 = noise2D(x1, y1, seed);

  const nx0 = n00 * (1 - u) + n10 * u;
  const nx1 = n01 * (1 - u) + n11 * u;

  return nx0 * (1 - v) + nx1 * v;
}

// Smoothstep function for smooth transitions
function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// ============================================
// GRASS BLADE CLASS
// ============================================

class GrassBlade {
  constructor(x, y, length, config) {
    this.rootX = x;
    this.rootY = y;
    this.length = length;
    this.config = config;

    // Physics state - initialize with random angle
    this.angle = (Math.random() - 0.5) * config.maxBend * 2; // Random angle in full range
    this.velocity = 0;        // Angular velocity
  }

  // Update physics - direct force application without spring-to-target
  update(windX, windY) {
    // Calculate wind force magnitude
    const windMagnitude = Math.sqrt(windX * windX + windY * windY);

    if (windMagnitude > 0.001) {
      // Wind direction
      const windAngle = Math.atan2(windX, -windY); // Wind direction (negated Y for canvas coords)

      // Calculate angular force based on wind direction relative to current angle
      // Force is perpendicular to the blade, pushing it to rotate
      const angleDiff = windAngle - this.angle;

      // Apply torque proportional to wind strength and angle difference
      const torque = Math.sin(angleDiff) * windMagnitude * this.config.stiffness;

      this.velocity += torque;
    }

    // Apply damping
    this.velocity *= this.config.damping;

    // Update angle
    this.angle += this.velocity;

    // Clamp to max bend
    this.angle = Math.max(-this.config.maxBend, Math.min(this.config.maxBend, this.angle));
  }

  // Draw the blade and root
  draw(ctx) {
    // Calculate tip position based on angle
    const tipX = this.rootX + Math.sin(this.angle) * this.length;
    const tipY = this.rootY - Math.cos(this.angle) * this.length;

    // Draw root dot
    ctx.globalAlpha = this.config.rootAlpha;
    ctx.fillStyle = this.config.rootColor;
    ctx.beginPath();
    ctx.arc(this.rootX, this.rootY, this.config.rootSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw blade
    ctx.globalAlpha = this.config.bladeAlpha;
    ctx.strokeStyle = this.config.bladeColor;
    ctx.lineWidth = this.config.bladeWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.rootX, this.rootY);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
  }
}

// ============================================
// GUST CLASS
// ============================================

class Gust {
  constructor(x, y, config) {
    this.x = x;
    this.y = y;
    this.config = config;
    this.birthTime = Date.now();
    this.duration = config.gustDuration;

    // Random direction
    this.angle = Math.random() * Math.PI * 2;
    this.dirX = Math.cos(this.angle);
    this.dirY = Math.sin(this.angle);
  }

  // Check if gust is still alive
  isAlive() {
    return (Date.now() - this.birthTime) < this.duration;
  }

  // Get gust influence at a position
  getForce(x, y) {
    const dx = x - this.x;
    const dy = y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.config.gustRadius) {
      return { x: 0, y: 0 };
    }

    // Distance falloff
    const distFalloff = 1 - (dist / this.config.gustRadius);

    // Time envelope (fade in and out smoothly)
    const age = Date.now() - this.birthTime;
    const t = age / this.duration;
    const timeEnvelope = smoothstep(0, 0.2, t) * (1 - smoothstep(0.7, 1, t));

    // Combined strength
    const strength = this.config.gustStrength * distFalloff * timeEnvelope;

    return {
      x: this.dirX * strength,
      y: this.dirY * strength
    };
  }
}

// ============================================
// MAIN GRASS WIND BACKGROUND CLASS
// ============================================

class GrassWindBackground {
  constructor(container, userOptions = {}) {
    this.container = container;
    this.config = { ...DEFAULTS, ...userOptions };

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.config.reducedMotion = prefersReducedMotion;

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'grass-wind-canvas';
    this.ctx = this.canvas.getContext('2d');

    // Insert canvas at the beginning of container
    this.container.insertBefore(this.canvas, this.container.firstChild);

    // State
    this.blades = [];
    this.gusts = [];
    this.time = 0;
    this.animationFrame = null;
    this.lastFrameTime = 0;

    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseVelX = 0;
    this.mouseVelY = 0;
    this.smoothMouseVelX = 0;
    this.smoothMouseVelY = 0;
    this.isMouseOver = false;

    // Setup
    this.setupCanvas();
    this.setupBlades();
    this.setupEventListeners();
    this.start();
  }

  // Setup canvas size and pixel ratio
  setupCanvas() {
    const rect = this.container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';

    this.ctx.scale(dpr, dpr);

    this.width = rect.width;
    this.height = rect.height;
  }

  // Generate grass blades based on grid layout
  setupBlades() {
    this.blades = [];

    // Determine grid columns based on screen width
    const isMobile = this.width <= this.config.mobileBreakpoint;
    const columns = isMobile ? this.config.gridColumnsMobile : this.config.gridColumnsDesktop;

    // Calculate grid dimensions with square cells
    const cellSize = this.width / columns;
    const rows = Math.ceil(this.height / cellSize);

    // Generate blades in each grid cell
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Place blades in the center of each cell
        for (let b = 0; b < this.config.bladesPerCell; b++) {
          // Center position of the cell
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;

          const length = this.config.bladeLength.min +
                        Math.random() * (this.config.bladeLength.max - this.config.bladeLength.min);

          this.blades.push(new GrassBlade(x, y, length, this.config));
        }
      }
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Resize observer for responsive canvas
    this.resizeObserver = new ResizeObserver(() => {
      this.setupCanvas();
      this.setupBlades();
    });
    this.resizeObserver.observe(this.container);

    // Mouse tracking
    this.mouseMoveHandler = (e) => {
      const rect = this.container.getBoundingClientRect();
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    };

    this.mouseEnterHandler = () => {
      this.isMouseOver = true;
    };

    this.mouseLeaveHandler = () => {
      this.isMouseOver = false;
      this.smoothMouseVelX = 0;
      this.smoothMouseVelY = 0;
    };

    this.container.addEventListener('mousemove', this.mouseMoveHandler);
    this.container.addEventListener('mouseenter', this.mouseEnterHandler);
    this.container.addEventListener('mouseleave', this.mouseLeaveHandler);
  }

  // Calculate wind force at a position
  getWindForce(x, y) {
    // Base noise field (continuous, smooth)
    const noiseValue = smoothNoise(x, y, this.config.fieldScale, this.time);
    const noiseAngle = noiseValue * Math.PI * 2;

    let windX = Math.cos(noiseAngle) * this.config.fieldStrength;
    let windY = Math.sin(noiseAngle) * this.config.fieldStrength;

    // Add gust forces
    for (const gust of this.gusts) {
      const gustForce = gust.getForce(x, y);
      windX += gustForce.x;
      windY += gustForce.y;
    }

    // Add mouse wind
    if (this.isMouseOver) {
      const dx = x - this.mouseX;
      const dy = y - this.mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < this.config.mouseRadius && dist > 0) {
        const distFalloff = 1 - (dist / this.config.mouseRadius);
        const mouseForce = distFalloff * this.config.mouseStrength;

        windX += this.smoothMouseVelX * mouseForce;
        windY += this.smoothMouseVelY * mouseForce;
      }
    }

    return { x: windX, y: windY };
  }

  // Update simulation state
  update(deltaTime) {
    // Update time for noise field evolution
    this.time += this.config.fieldSpeed * deltaTime;

    // Update mouse velocity with smoothing
    if (this.isMouseOver) {
      this.mouseVelX = this.mouseX - this.lastMouseX;
      this.mouseVelY = this.mouseY - this.lastMouseY;

      // Low-pass filter for smooth velocity
      this.smoothMouseVelX += (this.mouseVelX - this.smoothMouseVelX) * this.config.mouseSmoothing;
      this.smoothMouseVelY += (this.mouseVelY - this.smoothMouseVelY) * this.config.mouseSmoothing;
    }

    // Spawn new gusts randomly from all directions
    if (Math.random() < this.config.gustFrequency) {
      // Randomly choose to spawn from edges or within the container
      const spawnFromEdge = Math.random() < 0.7; // 70% from edges, 30% from center

      let gustX, gustY;

      if (spawnFromEdge) {
        // Spawn from one of the four edges
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
          case 0: // Top edge
            gustX = Math.random() * this.width;
            gustY = -this.config.gustRadius * 0.5;
            break;
          case 1: // Right edge
            gustX = this.width + this.config.gustRadius * 0.5;
            gustY = Math.random() * this.height;
            break;
          case 2: // Bottom edge
            gustX = Math.random() * this.width;
            gustY = this.height + this.config.gustRadius * 0.5;
            break;
          case 3: // Left edge
            gustX = -this.config.gustRadius * 0.5;
            gustY = Math.random() * this.height;
            break;
        }
      } else {
        // Spawn anywhere within the container
        gustX = Math.random() * this.width;
        gustY = Math.random() * this.height;
      }

      this.gusts.push(new Gust(gustX, gustY, this.config));
    }

    // Remove dead gusts
    this.gusts = this.gusts.filter(gust => gust.isAlive());

    // Update all blades
    for (const blade of this.blades) {
      const wind = this.getWindForce(blade.rootX, blade.rootY);
      blade.update(wind.x, wind.y);
    }
  }

  // Render frame
  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw all blades
    for (const blade of this.blades) {
      blade.draw(this.ctx);
    }

    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  // Animation loop
  animate(currentTime) {
    if (!this.lastFrameTime) {
      this.lastFrameTime = currentTime;
    }

    const deltaTime = currentTime - this.lastFrameTime;

    // Handle reduced motion (lower frame rate)
    if (this.config.reducedMotion) {
      const minFrameTime = 1000 / this.config.reducedMotionFPS;
      if (deltaTime < minFrameTime) {
        this.animationFrame = requestAnimationFrame((t) => this.animate(t));
        return;
      }
    }

    this.lastFrameTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  // Start animation
  start() {
    if (!this.animationFrame) {
      this.animationFrame = requestAnimationFrame((t) => this.animate(t));
    }
  }

  // Stop animation
  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  // Destroy instance and cleanup
  destroy() {
    this.stop();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    this.container.removeEventListener('mousemove', this.mouseMoveHandler);
    this.container.removeEventListener('mouseenter', this.mouseEnterHandler);
    this.container.removeEventListener('mouseleave', this.mouseLeaveHandler);

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// ============================================
// PUBLIC API
// ============================================

/**
 * Initialize grass wind background on a container element
 * @param {HTMLElement} containerEl - Container element (e.g., .landing-container)
 * @param {Object} options - Configuration options (see DEFAULTS at top of file)
 * @returns {Object} - Object with destroy() method
 */
function initGrassWindBackground(containerEl, options = {}) {
  const instance = new GrassWindBackground(containerEl, options);

  return {
    destroy: () => instance.destroy()
  };
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initGrassWindBackground };
}
