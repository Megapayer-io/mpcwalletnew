'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { OrbitControls } from '@react-three/drei';

function Shield3D() {
  const shieldRef = useRef<Group>(null);
  const particlesRef = useRef<Mesh[]>([]);

  useFrame((state) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      shieldRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }

    particlesRef.current.forEach((particle, i) => {
      if (particle) {
        const time = state.clock.elapsedTime;
        particle.rotation.x = time * (0.4 + i * 0.1);
        particle.rotation.y = time * (0.3 + i * 0.1);
        particle.position.y = Math.sin(time * 1.5 + i) * 0.3;
      }
    });
  });

  return (
    <group ref={shieldRef}>
      {/* Shield Main */}
      <mesh>
        <coneGeometry args={[2, 3, 32]} />
        <meshStandardMaterial
          color="#22E1FF"
          metalness={0.7}
          roughness={0.3}
          emissive="#22E1FF"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Checkmark */}
      <mesh position={[0, -0.5, 0.2]}>
        <coneGeometry args={[0.3, 0.6, 3]} />
        <meshStandardMaterial color="#34D399" />
      </mesh>

      {/* Floating Particles */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 2.5;
        const y = Math.sin(angle) * 2.5;
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) particlesRef.current[i] = el;
            }}
            position={[x, y, 0]}
          >
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#22E1FF' : '#7C3AED'}
              emissive={i % 2 === 0 ? '#22E1FF' : '#7C3AED'}
              emissiveIntensity={0.9}
            />
          </mesh>
        );
      })}

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#22E1FF" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#7C3AED" />
      <directionalLight position={[0, 10, 5]} intensity={0.7} />
    </group>
  );
}

function Swap3D() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left Arrow */}
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.3, 1.5, 8]} />
        <meshStandardMaterial
          color="#22E1FF"
          metalness={0.8}
          roughness={0.2}
          emissive="#22E1FF"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Right Arrow */}
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.3, 1.5, 8]} />
        <meshStandardMaterial
          color="#7C3AED"
          metalness={0.8}
          roughness={0.2}
          emissive="#7C3AED"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Connecting Line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[3, 0.2, 0.2]} />
        <meshStandardMaterial
          color="#34D399"
          emissive="#34D399"
          emissiveIntensity={0.3}
        />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#22E1FF" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#7C3AED" />
    </group>
  );
}

function Checkmark3D() {
  const checkRef = useRef<Group>(null);

  useFrame((state) => {
    if (checkRef.current) {
      checkRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      checkRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 1) * 0.1);
    }
  });

  return (
    <group ref={checkRef}>
      {/* Checkmark Shape */}
      <mesh position={[0, 0.3, 0]} rotation={[-Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.3, 1.5, 0.3]} />
        <meshStandardMaterial
          color="#34D399"
          metalness={0.8}
          roughness={0.2}
          emissive="#34D399"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh position={[0.6, -0.2, 0]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshStandardMaterial
          color="#34D399"
          metalness={0.8}
          roughness={0.2}
          emissive="#34D399"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Circle Background */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial
          color="#34D399"
          opacity={0.2}
          transparent
          emissive="#34D399"
          emissiveIntensity={0.3}
        />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#34D399" />
      <pointLight position={[-5, -5, -5]} intensity={1} color="#22E1FF" />
    </group>
  );
}

export function ShieldGraphic3D() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <Shield3D />
      </Canvas>
    </div>
  );
}

export function SwapGraphic3D() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
        <Swap3D />
      </Canvas>
    </div>
  );
}

export function CheckmarkGraphic3D() {
  return (
    <div className="w-full h-80 flex items-center justify-center">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
      >
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
        <Checkmark3D />
      </Canvas>
    </div>
  );
}

