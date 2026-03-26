import type { Transition } from 'framer-motion';

export const dsMotion = {
  duration: {
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.8,
    float: 4,
    floatSlow: 5,
  },
  ease: {
    default: [0.16, 1, 0.3, 1] as const,
    out: 'easeOut' as const,
    inOut: 'easeInOut' as const,
  },
  spring: {
    default: { type: 'spring' as const, stiffness: 380, damping: 32, mass: 0.85 },
    crisp: { type: 'spring' as const, stiffness: 420, damping: 30 },
    snappy: { type: 'spring' as const, stiffness: 450, damping: 32 },
    settle: { type: 'spring' as const, stiffness: 400, damping: 28 },
    smooth: { type: 'spring' as const, stiffness: 420, damping: 28 },
  },
  stagger: {
    default: 0.07,
    tight: 0.08,
    bars: 0.1,
  },
  instant: { duration: 0 },
};

export function withReducedMotion(
  shouldReduceMotion: boolean,
  transition: Transition,
): Transition {
  return shouldReduceMotion ? dsMotion.instant : transition;
}
