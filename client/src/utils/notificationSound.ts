/**
 * Notification sound utility using Web Audio API
 * Creates pleasant notification sounds without external audio files
 */

// Audio context singleton
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a success notification sound (pleasant chime)
 */
export const playSuccessSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create oscillator for main tone
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Pleasant major chord frequencies
  osc1.frequency.value = 523.25; // C5
  osc2.frequency.value = 659.25; // E5

  osc1.type = 'sine';
  osc2.type = 'sine';

  // Connect nodes
  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Envelope
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

  // Play
  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 0.5);
  osc2.stop(now + 0.5);

  // Second chime (higher pitch)
  setTimeout(() => {
    const osc3 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();

    osc3.frequency.value = 783.99; // G5
    osc3.type = 'sine';

    osc3.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    const now2 = ctx.currentTime;
    gainNode2.gain.setValueAtTime(0, now2);
    gainNode2.gain.linearRampToValueAtTime(0.25, now2 + 0.05);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now2 + 0.4);

    osc3.start(now2);
    osc3.stop(now2 + 0.4);
  }, 150);
};

/**
 * Play an error notification sound (descending tone)
 */
export const playErrorSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

  osc.start(now);
  osc.stop(now + 0.3);
};

/**
 * Play a subtle click sound
 */
export const playClickSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 1000;

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.05);
};

const notificationSounds = {
  playSuccessSound,
  playErrorSound,
  playClickSound,
};

export default notificationSounds;
