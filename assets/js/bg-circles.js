// ============================================
// MOVING CIRCLES BACKGROUND MODULE
// Dynamically spawns and animates circles
// ============================================

/**
 * Generate random position and direction for a circle
 * @param {number} distance - Total distance to travel in pixels
 * @returns {Object} Object with startX, startY, endX, endY
 */
function generateRandomPath(distance) {
  // Generate random start position (from edges or slightly outside)
  const startEdge = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
  let startX, startY;

  switch (startEdge) {
    case 0: // Top edge
      startX = Math.random() * window.innerWidth;
      startY = -80 - Math.random() * 60;
      break;
    case 1: // Right edge
      startX = window.innerWidth + 80 + Math.random() * 60;
      startY = Math.random() * window.innerHeight;
      break;
    case 2: // Bottom edge
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 80 + Math.random() * 60;
      break;
    case 3: // Left edge
      startX = -80 - Math.random() * 60;
      startY = Math.random() * window.innerHeight;
      break;
  }

  // Generate random direction (angle in radians)
  const angle = Math.random() * Math.PI * 2;

  // Calculate end position based on direction and distance
  const endX = startX + Math.cos(angle) * distance;
  const endY = startY + Math.sin(angle) * distance;

  return {
    startX: `${startX}px`,
    startY: `${startY}px`,
    endX: `${endX}px`,
    endY: `${endY}px`
  };
}

/**
 * Generate random color along gradient spectrum
 * @param {string} colorStart - Start color
 * @param {string} colorEnd - End color
 * @returns {string} CSS color-mix string
 */
function generateRandomColor(colorStart, colorEnd) {
  const percentage = Math.floor(Math.random() * 101); // 0-100
  return `color-mix(in srgb, ${colorStart} ${percentage}%, ${colorEnd} ${100 - percentage}%)`;
}

/**
 * Create and spawn a new circle element
 * @param {HTMLElement} container - Container element
 * @param {number} distance - Travel distance
 * @param {string} colorStart - Gradient start color
 * @param {string} colorEnd - Gradient end color
 * @param {number} duration - Animation duration in seconds
 */
function spawnCircle(container, distance, colorStart, colorEnd, duration) {
  const circle = document.createElement('div');
  circle.className = 'circle';

  // Set random path
  const path = generateRandomPath(distance);
  circle.style.setProperty('--start-x', path.startX);
  circle.style.setProperty('--start-y', path.startY);
  circle.style.setProperty('--end-x', path.endX);
  circle.style.setProperty('--end-y', path.endY);

  // Set random color
  const color = generateRandomColor(colorStart, colorEnd);
  circle.style.background = `radial-gradient(circle, ${color} 0%, transparent 70%)`;

  // No initial delay for spawned circles
  circle.style.animationDelay = '0s';

  // Add to container
  container.appendChild(circle);

  // Remove circle after animation completes
  const durationMs = duration * 1000;
  setTimeout(() => {
    if (circle.parentNode) {
      circle.parentNode.removeChild(circle);
    }
  }, durationMs);
}

/**
 * Initialize circle spawning system
 * @param {string} containerSelector - Selector for the container (e.g., '.moving-circles')
 */
function initRandomCircles(containerSelector = '.moving-circles') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  // Get configuration from CSS variables
  const computedStyle = getComputedStyle(document.documentElement);

  const speedPerSecond = parseFloat(computedStyle.getPropertyValue('--circle-speed')) || 80;
  const durationSeconds = parseFloat(computedStyle.getPropertyValue('--circle-duration')) || 5;
  const spawnInterval = parseFloat(computedStyle.getPropertyValue('--circle-spawn-interval')) || 100;
  const spawnProbability = parseFloat(computedStyle.getPropertyValue('--circle-spawn-probability')) || 0.3;

  const colorStart = computedStyle.getPropertyValue('--gradient-color-start').trim() ||
                     'color-mix(in srgb, var(--cuchilleras-primary) 10%, transparent)';
  const colorEnd = computedStyle.getPropertyValue('--gradient-color-end').trim() ||
                   'color-mix(in srgb, var(--flipar-primary) 10%, transparent)';

  // Calculate total distance
  const totalDistance = speedPerSecond * durationSeconds;

  // Set up spawn interval
  setInterval(() => {
    if (Math.random() < spawnProbability) {
      spawnCircle(container, totalDistance, colorStart, colorEnd, durationSeconds);
    }
  }, spawnInterval);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initRandomCircles());
} else {
  initRandomCircles();
}

// Export for manual use if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initRandomCircles };
}
