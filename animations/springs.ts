import type { Transition } from "motion/react";

export const springs = {
  default: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 15,
  } as Transition,

  snappy: {
    type: "spring",
    stiffness: 500,
    damping: 35,
  } as Transition,

  gentle: {
    type: "spring",
    stiffness: 100,
    damping: 20,
  } as Transition,

  micro: {
    type: "spring",
    stiffness: 600,
    damping: 40,
  } as Transition,

  page: {
    type: "spring",
    stiffness: 250,
    damping: 30,
  } as Transition,
};

export const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: springs.page },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springs.default },
};

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: springs.bouncy },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: springs.default },
};

export const bottomSheetVariants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: springs.default },
  exit: { y: "100%", transition: { duration: 0.25 } },
};

export const cardHover = {
  whileTap: { scale: 0.97, transition: springs.micro },
};
