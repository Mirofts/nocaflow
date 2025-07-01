// components/utils/motionVariants.js
export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50, damping: 20, mass: 0.5 } },
};