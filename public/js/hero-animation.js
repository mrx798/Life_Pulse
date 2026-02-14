/**
 * LifePulse Hero Animation System
 * Premium animated backgrounds for donor pages
 * Respects user motion preferences
 */

class HeroAnimation {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.flows = [];
    this.animationId = null;
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isRunning = false;

    this.init();
  }

  init() {
    // Only initialize if not reduced motion and on donor page
    if (this.isReducedMotion || !document.querySelector('.donor-theme')) {
      return;
    }

    this.createCanvas();
    this.createParticles();
    this.createFlows();
    this.bindEvents();
    this.start();
  }

  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'hero-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.opacity = '0.4';

    this.ctx = this.canvas.getContext('2d');
    document.body.appendChild(this.canvas);
    this.resize();
  }

  resize() {
    if (!this.canvas) return;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticles() {
    this.particles = [];
    const particleCount = Math.min(50, Math.floor((this.canvas.width * this.canvas.height) / 20000));

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: this.getRandomColor(),
        life: Math.random() * 100 + 50,
        maxLife: 150
      });
    }
  }

  createFlows() {
    this.flows = [];
    const flowCount = 3;

    for (let i = 0; i < flowCount; i++) {
      this.flows.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 100 + 50,
        color: this.getRandomColor(),
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.01
      });
    }
  }

  getRandomColor() {
    const colors = [
      'rgba(0, 212, 255, 0.1)',
      'rgba(139, 92, 246, 0.1)',
      'rgba(236, 72, 153, 0.1)',
      'rgba(16, 185, 129, 0.1)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      // Respawn dead particles
      if (particle.life <= 0) {
        Object.assign(particle, {
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: particle.maxLife,
          color: this.getRandomColor()
        });
      }
    });
  }

  updateFlows() {
    this.flows.forEach(flow => {
      flow.x += flow.vx;
      flow.y += flow.vy;
      flow.rotation += flow.rotationSpeed;

      // Wrap around edges
      if (flow.x < -flow.size) flow.x = this.canvas.width + flow.size;
      if (flow.x > this.canvas.width + flow.size) flow.x = -flow.size;
      if (flow.y < -flow.size) flow.y = this.canvas.height + flow.size;
      if (flow.y > this.canvas.height + flow.size) flow.y = -flow.size;
    });
  }

  drawParticles() {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color.replace('0.1', (particle.life / particle.maxLife * 0.1).toString());
      this.ctx.fill();
    });
  }

  drawFlows() {
    this.flows.forEach(flow => {
      this.ctx.save();
      this.ctx.translate(flow.x, flow.y);
      this.ctx.rotate(flow.rotation);

      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, flow.size, flow.size * 0.3, 0, 0, Math.PI * 2);
      this.ctx.fillStyle = flow.color;
      this.ctx.fill();

      this.ctx.restore();
    });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawFlows();
    this.drawParticles();
  }

  animate = () => {
    if (!this.isRunning) return;

    this.updateParticles();
    this.updateFlows();
    this.draw();
    this.animationId = requestAnimationFrame(this.animate);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
      this.createFlows();
    });

    // Pause on visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    // Re-check motion preference
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        this.stop();
        if (this.canvas) {
          this.canvas.style.display = 'none';
        }
      } else {
        if (this.canvas) {
          this.canvas.style.display = 'block';
        }
        this.start();
      }
    });
  }

  destroy() {
    this.stop();
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.heroAnimation = new HeroAnimation();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.heroAnimation) {
    window.heroAnimation.destroy();
  }
});