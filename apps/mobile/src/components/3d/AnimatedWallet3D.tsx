'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { OrbitControls } from '@react-three/drei';

function WalletIcon3D() {
  const walletRef = useRef<Mesh>(null);
  const particlesRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    if (walletRef.current) {
      walletRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      walletRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }

    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const time = state.clock.elapsedTime;
        particle.rotation.x = time * (0.5 + i * 0.1);
        particle.rotation.y = time * (0.3 + i * 0.1);
        particle.position.y = Math.sin(time * 2 + i) * 0.2;
      }
    });
  });

  const particlePositions = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => [
      Math.cos((i / 8) * Math.PI * 2) * 1.5,
      Math.sin((i / 8) * Math.PI * 2) * 1.5,
      (Math.random() - 0.5) * 0.5,
    ] as [number, number, number]);
  }, []);

  return (
    <group>
      {/* Main Wallet Card */}
      <mesh ref={walletRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.2, 0.1]} />
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.8}
          roughness={0.2}
          emissive="#1e40af"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Wallet Cards Inside */}
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[1.8, 1, 0.05]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Floating Particles */}
      {particlePositions.map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) particlesRef.current[i] = el;
          }}
          position={pos}
        >
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#22E1FF' : '#7C3AED'}
            emissive={i % 2 === 0 ? '#22E1FF' : '#7C3AED'}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#22E1FF" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#7C3AED" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
    </group>
  );
}

function GearIcon3D() {
  const gearRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (gearRef.current) {
      gearRef.current.rotation.z = state.clock.elapsedTime * 0.5;
      gearRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <group>
      {/* Main Gear */}
      <mesh ref={gearRef}>
        <torusGeometry args={[1, 0.3, 16, 32]} />
        <meshStandardMaterial
          color="#FF7A45"
          metalness={0.8}
          roughness={0.2}
          emissive="#FF7A45"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Center Circle */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 0.2, 32]} />
        <meshStandardMaterial
          color="#FF7A45"
          metalness={0.9}
          roughness={0.1}
          emissive="#FF7A45"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Gear Teeth */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * 1.5;
        const y = Math.sin(angle) * 1.5;
        return (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.3, 0.8, 0.2]} />
            <meshStandardMaterial
              color="#FF7A45"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}

      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#FF7A45" />
      <pointLight position={[-5, -5, -5]} intensity={0.8} color="#FF5722" />
    </group>
  );
}

export function AnimatedWallet3D() {
  return (
    <div className="w-24 h-24">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        <WalletIcon3D />
      </Canvas>
    </div>
  );
}

export function AnimatedGear3D() {
  return (
    <div className="w-24 h-24">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        <GearIcon3D />
      </Canvas>
    </div>
  );
}

