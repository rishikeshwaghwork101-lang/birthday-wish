// --- Global State & Configuration ---
const balloonColors = ['#ff3e7f', '#a855f7', '#eab308', '#06b6d4', '#10b981', '#f97316'];
let isEnvelopeOpen = false;
let blownCandlesCount = 0;
let countdownInterval;

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

// Modal Elements
const letterModal = document.getElementById('letterModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');

// Countdown Elements
const lockScreen = document.getElementById('lockScreen');
const skipTimerBtn = document.getElementById('skipTimerBtn');
const daysVal = document.getElementById('days');
const hoursVal = document.getElementById('hours');
const minutesVal = document.getElementById('minutes');
const secondsVal = document.getElementById('seconds');

// Cake Elements
const cakeSection = document.getElementById('cakeSection');
const cakeWish = document.getElementById('cakeWish');
const cakePrompt = document.querySelector('.cake-prompt');
const candles = [
  document.getElementById('candle-1'),
  document.getElementById('candle-2'),
  document.getElementById('candle-3')
];

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

// --- Web Audio API Synth Blow/Whoosh Sound ---
const playBlowSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Generate white noise buffer
    const bufferSize = ctx.sampleRate * 0.25; // 0.25 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to simulate air blow whoosh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.25);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
    noise.stop(ctx.currentTime + 0.25);
  } catch (err) {
    console.warn('AudioContext blowout sound failed:', err);
  }
};

// --- Countdown Live Ticker ---
const initCountdown = () => {
  const targetDate = new Date('2026-07-15T00:00:00');
  
  const updateCountdown = () => {
    const now = new Date();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      clearInterval(countdownInterval);
      unlockWebsite();
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    daysVal.textContent = String(days).padStart(2, '0');
    hoursVal.textContent = String(hours).padStart(2, '0');
    minutesVal.textContent = String(minutes).padStart(2, '0');
    secondsVal.textContent = String(seconds).padStart(2, '0');
  };
  
  // Run once immediately
  updateCountdown();
  
  // Set interval
  countdownInterval = setInterval(updateCountdown, 1000);
};

const unlockWebsite = () => {
  lockScreen.classList.add('unlocked');
  
  // Explode confetti on unlock
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 }
      });
    }, 250);
  }
  
  if (countdownInterval) {
    clearInterval(countdownInterval);
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
      ctx.shadowBlur = 0;
    }
  }
  
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
  balloon.style.color = color;
  
  const size = Math.floor(Math.random() * 25) + 50;
  balloon.style.width = `${size}px`;
  balloon.style.height = `${size * 1.25}px`;
  
  const leftPos = Math.random() * 90;
  balloon.style.left = `${leftPos}vw`;
  
  const duration = Math.random() * 6 + 6;
  balloon.style.animationDuration = `${duration}s`;
  
  const string = document.createElement('div');
  string.classList.add('balloon-string');
  balloon.appendChild(string);
  
  balloon.addEventListener('click', (e) => {
    e.stopPropagation();
    popBalloon(balloon, e.clientX, e.clientY, color);
  });
  
  balloonContainer.appendChild(balloon);
  
  balloon.addEventListener('animationend', () => {
    balloon.remove();
  });
};

const popBalloon = (balloonEl, x, y, color) => {
  playPopSound();
  
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

// --- Music Player Control ---
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
  
  playMusic();
  
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  }
  
  spawnBalloons(8);
  
  setInterval(() => {
    if (document.querySelectorAll('.balloon').length < 15) {
      createBalloon();
    }
  }, 2500);

  setTimeout(() => {
    letterModal.classList.add('show');
  }, 1200);
};

// --- Interactive Cake Blowout Mechanics ---
const blowCandle = (candleEl) => {
  if (candleEl.classList.contains('blown')) return;
  
  playBlowSound();
  candleEl.classList.add('blown');
  blownCandlesCount++;
  
  if (blownCandlesCount === 3) {
    setTimeout(triggerGrandFinale, 400);
  }
};

const triggerGrandFinale = () => {
  // Hide prompt and reveal wish message
  cakePrompt.classList.add('fade-out');
  cakeWish.classList.add('show-wish');
  
  // Grand Confetti Blast
  if (typeof confetti === 'function') {
    // Cannon Left
    confetti({
      particleCount: 85,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 }
    });
    // Cannon Right
    confetti({
      particleCount: 85,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 }
    });
    
    // Middle shower delay
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    }, 300);
  }
  
  // Spawn a wave of celebratory balloons
  spawnBalloons(10);
};

// --- Event Listeners ---
document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initParticles();
  
  // Skip Countdown Click
  skipTimerBtn.addEventListener('click', () => {
    unlockWebsite();
  });
  
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

  // Modal close triggers showing the cake
  const handleModalClose = () => {
    letterModal.classList.remove('show');
    
    // Reveal cake section
    cakeSection.classList.add('show-cake');
    
    // Smooth scroll down to cake section
    setTimeout(() => {
      cakeSection.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 400);
  };

  closeModalBtn.addEventListener('click', handleModalClose);
  modalOverlay.addEventListener('click', handleModalClose);
  
  // Candle clicking blow event bindings
  candles.forEach(candle => {
    if (candle) {
      candle.addEventListener('click', () => {
        blowCandle(candle);
      });
    }
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
