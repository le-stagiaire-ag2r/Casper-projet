import React, { useEffect, useRef, createContext, useContext } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Create context for Lenis instance
interface LenisContextType {
  lenis: Lenis | null;
}

const LenisContext = createContext<LenisContextType>({ lenis: null });

export const useLenis = () => useContext(LenisContext);

interface SmoothScrollProps {
  children: React.ReactNode;
}

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // Add Lenis to GSAP ticker
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Disable GSAP's default lag smoothing
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current }}>
      {children}
    </LenisContext.Provider>
  );
};

// Hook for scroll-triggered animations
export const useScrollAnimation = () => {
  const createScrollTrigger = (
    element: HTMLElement,
    animation: gsap.core.Tween | gsap.core.Timeline,
    options?: ScrollTrigger.Vars
  ) => {
    return ScrollTrigger.create({
      trigger: element,
      start: 'top bottom-=100',
      end: 'bottom top',
      animation,
      toggleActions: 'play none none reverse',
      ...options,
    });
  };

  const fadeInUp = (element: HTMLElement, delay = 0) => {
    const tween = gsap.fromTo(
      element,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out' }
    );
    createScrollTrigger(element, tween);
    return tween;
  };

  const parallax = (element: HTMLElement, speed = 0.5) => {
    return ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const movement = (self.progress - 0.5) * 100 * speed;
        gsap.set(element, { y: movement });
      },
    });
  };

  const scaleOnScroll = (element: HTMLElement, fromScale = 1, toScale = 0.8) => {
    return ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const scale = fromScale - (fromScale - toScale) * self.progress;
        const borderRadius = self.progress * 24;
        gsap.set(element, { scale, borderRadius });
      },
    });
  };

  return { createScrollTrigger, fadeInUp, parallax, scaleOnScroll };
};

export default SmoothScroll;
