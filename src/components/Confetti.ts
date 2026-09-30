'use client';

import confetti from 'canvas-confetti';

export function triggerConfetti() {
  if (typeof window === 'undefined') return;

  // Duolingo celebration colors
  const colors = ['#58CC02', '#78D933', '#1CB0F6', '#FF9600', '#CE82FF', '#FFC800'];

  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: colors,
    disableForReducedMotion: true,
  });

  // Secondary firework burst
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });
  }, 250);
}
