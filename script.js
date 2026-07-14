// --- Global State & Configuration ---
const balloonColors = ['#ff3e7f', '#a855f7', '#eab308', '#06b6d4', '#10b981', '#f97316'];
let isEnvelopeOpen = false;

// --- DOM Elements ---
const particleCanvas = document.getElementById('particleCanvas');
const balloonContainer = document.getElementById('balloonContainer');
const envelopeWrapper = document.getElementById('envelopeWrapper');
const waxSeal = document.getElementById('waxSeal');
const introHeader = document.getElementById('introHeader');
const celebrationControls = document.getElementById('celebrationControls');
const confettiBtn = document.getElementById('confettiBtn');
const balloonSpawnBtn = document.getElementById('balloonSpawnBtn');
const bgMusic = document.getElementById('bgMusic');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicIcon = document.getElementById('musicIcon');
const musicStatus = document.getElementById('musicStatus');

const letterModal = document.getElementById('letterModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');


// --- Web Audio API Synth Pop Sound ---
const playPopSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    // Quick sweep upwards to simulate a balloon pop
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (err) {
    console.warn('Web Audio API not allowed or supported yet:', err);
  }
};

// --- Fullscreen Particle Background System ---
const initParticles = () => {
  const ctx = particleCanvas.getContext('2d');
  let particles = [];
  
  const resizeCanvas = () => {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.reset();
    }
    
    reset() {
      this.x = Math.random() * particleCanvas.width;
      this.y = particleCanvas.height + Math.random() * 100;
      this.size = Math.random() * 2 + 1;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.color = Math.random() > 0.5 ? '#a855f7' : '#ff3e7f';
    }
    
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      
      // Reset if offscreen top or sides
      if (this.y < -10 || this.x < -10 || this.x > particleCanvas.width + 10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  }
  
  // Create particles
  const particleCount = Math.min(60, Math.floor(window.innerWidth / 20));
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  const animate = () => {
    ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  };
  
  animate();
};

// --- Balloon Spawning & Popping ---
const createBalloon = () => {
  const balloon = document.createElement('div');
  balloon.classList.add('balloon');
  
  const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  balloon.style.backgroundColor = color;
  balloon.style.color = color; // For the string-connector triangle color
  
  // Random horizontal position, size, sway offset
  const size = Math.floor(Math.random() * 25) + 50; // 50px - 75px
  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.25}px`;
  
  const leftPos = Math.random() * 90; // 0% - 90%
  balloon.style.left = `${leftPos}vw`;
  
  // Random vertical speed (animation-duration)
  const duration = Math.random() * 6 + 6; // 6s - 12s
  balloon.style.animationDuration = `${duration}s`;
  
  // Add balloon string
  const string = document.createElement('div');
  string.classList.add('balloon-string');
  balloon.appendChild(string);
  
  // Pop Balloon Click Handler
  balloon.addEventListener('click', (e) => {
    e.stopPropagation();
    popBalloon(balloon, e.clientX, e.clientY, color);
  });
  
  balloonContainer.appendChild(balloon);
  
  // Remove balloon when animation ends
  balloon.addEventListener('animationend', () => {
    balloon.remove();
  });
};

const popBalloon = (balloonEl, x, y, color) => {
  playPopSound();
  
  // Trigger a mini-confetti explosion at pop location
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 20,
      spread: 40,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight
      },
      colors: [color, '#ffffff'],
      disableForced3d: true
    });
  }
  
  // Visual explosion pop animation in DOM
  balloonEl.style.transform = 'scale(1.3)';
  balloonEl.style.opacity = '0';
  balloonEl.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
  
  setTimeout(() => {
    balloonEl.remove();
  }, 100);
};

const spawnBalloons = (count) => {
  for (let i = 0; i < count; i++) {
    setTimeout(createBalloon, i * 250);
  }
};

// --- Music Player Widget Control ---
const toggleMusic = () => {
  if (bgMusic.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
};

const playMusic = () => {
  bgMusic.play().then(() => {
    musicIcon.className = 'fas fa-pause';
    musicStatus.textContent = 'Playing';
    musicToggleBtn.classList.add('playing');
  }).catch(err => {
    console.warn("Autoplay blocked by browser. Interaction required first.", err);
    musicStatus.textContent = 'Blocked 🔇';
  });
};

const pauseMusic = () => {
  bgMusic.pause();
  musicIcon.className = 'fas fa-play';
  musicStatus.textContent = 'Paused';
  musicToggleBtn.classList.remove('playing');
};

// --- Envelope Open Actions ---
const openEnvelope = () => {
  if (isEnvelopeOpen) return;
  isEnvelopeOpen = true;
  
  envelopeWrapper.classList.add('open');
  introHeader.classList.add('fade-out');
  celebrationControls.classList.add('show');
  
  // Start the celebratory music
  playMusic();
  
  // Big Confetti Blast!
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
  
  // Release initial swarm of balloons
  spawnBalloons(8);
  
  // Start periodic spawning of background balloons
  setInterval(() => {
    if (document.querySelectorAll('.balloon').length < 15) {
      createBalloon();
    }
  }, 2500);

  // Open the detailed letter modal after a small delay (allowing envelope unfold animation)
  setTimeout(() => {
    letterModal.classList.add('show');
  }, 1200);
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  
  // Wax Seal / Envelope click triggers opening
  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });
  
  envelopeWrapper.addEventListener('click', () => {
    if (!isEnvelopeOpen) {
      openEnvelope();
    } else {
      letterModal.classList.add('show');
    }
  });

  // Modal close handlers
  closeModalBtn.addEventListener('click', () => {
    letterModal.classList.remove('show');
  });
  
  modalOverlay.addEventListener('click', () => {
    letterModal.classList.remove('show');
  });
  
  // Confetti trigger button
  confettiBtn.addEventListener('click', () => {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  });
  
  // Balloon spawn button
  balloonSpawnBtn.addEventListener('click', () => {
    spawnBalloons(6);
  });
  
  // Music player toggle
  musicToggleBtn.addEventListener('click', toggleMusic);
});
