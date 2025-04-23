import React from 'react';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '../utils/useIntersectionObserver';

interface AnimatedTileProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const AnimatedTile: React.FC<AnimatedTileProps> = ({ children, delay = 0, className = '' }) => {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`tile-hover ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedTile;