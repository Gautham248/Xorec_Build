import { type MotionValue, useScroll, useTransform } from "framer-motion";

export const useParallax = (value: MotionValue<number>, distance: number) => {
  return useTransform(value, [0, 1], [-distance, distance]);
};

export const useBoundedScroll = (bounds: number) => {
  const { scrollY } = useScroll();
  const scrollYBounded = useTransform(scrollY, [0, bounds], [0, 1]);
  const scrollYBoundedProgress = useTransform(scrollY, [0, bounds], [0, 1], {
    clamp: false,
  });

  return { scrollYBounded, scrollYBoundedProgress };
};

export const cn = (...inputs: (string | undefined)[]) => {
  return inputs.filter(Boolean).join(" ");
};