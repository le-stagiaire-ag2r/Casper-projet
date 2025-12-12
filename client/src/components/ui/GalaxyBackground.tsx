import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import styled from 'styled-components';

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, #0a0a12 0%, #000000 100%);
`;

// Overlay avec dégradé violet pour améliorer la lisibilité
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(15, 10, 25, 0.85) 0%,
    rgba(25, 15, 40, 0.75) 25%,
    rgba(35, 20, 55, 0.70) 50%,
    rgba(25, 15, 40, 0.75) 75%,
    rgba(15, 10, 25, 0.85) 100%
  );
`;

// Créer une texture circulaire pour les particules (effet planète/sphère)
const createCircleTexture = (): THREE.Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Gradient radial pour un effet de sphère lumineuse
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(32, 32, 32, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// Configuration de la galaxie
const GALAXY_CONFIG = {
  particleCount: 15000,
  branches: 5,
  spin: 1.2,
  randomness: 0.3,
  randomnessPower: 3,
  insideColor: '#ff6b35',
  outsideColor: '#1a1aff',
  size: 0.015,
  radius: 5,
};

// Composant pour les particules d'étoiles de fond
const BackgroundStars: React.FC = () => {
  const starsRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => createCircleTexture(), []);

  const [positions, sizes] = useMemo(() => {
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Sphère aléatoire autour de la caméra
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 20 + Math.random() * 30;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      sizes[i] = Math.random() * 2;
    }

    return [positions, sizes];
  }, []);

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        sizeAttenuation={true}
        color="#ffffff"
        transparent={true}
        opacity={0.8}
        depthWrite={false}
        map={circleTexture}
      />
    </points>
  );
};

// Composant principal de la galaxie
interface GalaxyProps {
  scrollProgress: number;
}

const Galaxy: React.FC<GalaxyProps> = ({ scrollProgress }) => {
  const galaxyRef = useRef<THREE.Points>(null);
  const { camera } = useThree();
  const circleTexture = useMemo(() => createCircleTexture(), []);

  // Générer les particules de la galaxie en spirale
  const [positions, colors, sizes] = useMemo(() => {
    const { particleCount, branches, spin, randomness, randomnessPower, radius } = GALAXY_CONFIG;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const insideColor = new THREE.Color(GALAXY_CONFIG.insideColor);
    const outsideColor = new THREE.Color(GALAXY_CONFIG.outsideColor);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position sur le rayon
      const r = Math.random() * radius;
      const branchAngle = (i % branches) / branches * Math.PI * 2;
      const spinAngle = r * spin;

      // Ajout de randomness avec une distribution en power
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.3;
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Couleur basée sur la distance au centre
      const mixedColor = insideColor.clone();
      mixedColor.lerp(outsideColor, r / radius);

      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      // Taille variable
      sizes[i] = Math.random() * 2;
    }

    return [positions, colors, sizes];
  }, []);

  // Animation de rotation et zoom au scroll
  useFrame((state) => {
    if (galaxyRef.current) {
      // Rotation continue
      galaxyRef.current.rotation.y = state.clock.elapsedTime * 0.05;

      // Légère inclinaison oscillante
      galaxyRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1 + 0.4;
    }

    // Zoom out basé sur le scroll (s'éloigne quand on scroll)
    const baseZ = 4;
    const maxZoom = 15;
    const targetZ = baseZ + scrollProgress * maxZoom;

    // Smooth lerp pour le mouvement de caméra
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);

    // Légère élévation au scroll
    const targetY = scrollProgress * 3;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
  });

  return (
    <points ref={galaxyRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={GALAXY_CONFIG.size * 2}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={circleTexture}
      />
    </points>
  );
};

// Composant pour les nébuleuses
const Nebula: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  const nebulaRef = useRef<THREE.Points>(null);
  const circleTexture = useMemo(() => createCircleTexture(), []);

  const [positions, colors] = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const r = 2 + Math.random() * 4;

      positions[i3] = Math.cos(theta) * r + (Math.random() - 0.5) * 2;
      positions[i3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i3 + 2] = Math.sin(theta) * r + (Math.random() - 0.5) * 2;

      // Couleurs de nébuleuse (violet/rose/bleu)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i3] = 0.5 + Math.random() * 0.3;     // R
        colors[i3 + 1] = 0.1 + Math.random() * 0.2; // G
        colors[i3 + 2] = 0.8 + Math.random() * 0.2; // B
      } else if (colorChoice < 0.66) {
        colors[i3] = 0.8 + Math.random() * 0.2;     // R
        colors[i3 + 1] = 0.2 + Math.random() * 0.3; // G
        colors[i3 + 2] = 0.5 + Math.random() * 0.3; // B
      } else {
        colors[i3] = 0.2 + Math.random() * 0.2;     // R
        colors[i3 + 1] = 0.4 + Math.random() * 0.3; // G
        colors[i3 + 2] = 0.9 + Math.random() * 0.1; // B
      }
    }

    return [positions, colors];
  }, []);

  useFrame((state) => {
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = state.clock.elapsedTime * 0.03;
      nebulaRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
    }
  });

  return (
    <points ref={nebulaRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        sizeAttenuation={true}
        vertexColors={true}
        transparent={true}
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        map={circleTexture}
      />
    </points>
  );
};

// Scène principale
const Scene: React.FC<{ scrollProgress: number }> = ({ scrollProgress }) => {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 15, 50]} />
      <BackgroundStars />
      <Galaxy scrollProgress={scrollProgress} />
      <Nebula scrollProgress={scrollProgress} />
    </>
  );
};

// Composant exporté
export const GalaxyBackground: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Calculer la progression du scroll (0 à 1)
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Container>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 75 }}
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
        >
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </Container>
      <Overlay />
    </>
  );
};

export default GalaxyBackground;
