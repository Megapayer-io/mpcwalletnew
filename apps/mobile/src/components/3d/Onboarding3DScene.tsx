'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { OrbitControls } from '@react-three/drei';

// Wallet 3D Vector Scene
function Wallet3DScene() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main wallet card */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1.4, 0.15]} />
        <meshStandardMaterial
          color="#3b82f6"
          metalness={0.7}
          roughness={0.2}
          emissive="#2563eb"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Inner card */}
      <mesh position={[0, -0.3, 0.08]}>
        <boxGeometry args={[1.8, 1, 0.05]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Card chip */}
      <mesh position={[-0.6, -0.3, 0.1]}>
        <boxGeometry args={[0.2, 0.25, 0.02]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Card lines */}
      <mesh position={[-0.3, -0.3, 0.1]}>
        <boxGeometry args={[0.8, 0.05, 0.01]} />
        <meshStandardMaterial color="#e0e7ff" />
      </mesh>
      <mesh position={[-0.3, -0.35, 0.1]}>
        <boxGeometry args={[0.5, 0.05, 0.01]} />
        <meshStandardMaterial color="#e0e7ff" />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#3b82f6" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#8b5cf6" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
    </group>
  );
}

// Shield 3D Vector Scene
function Shield3DScene() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main shield */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[1.2, 2.5, 32]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.7}
          roughness={0.2}
          emissive="#059669"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Shield base */}
      <mesh position={[0, -1.5, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.1]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>

      {/* Checkmark */}
      <group position={[0, 0.2, 0.2]}>
        <mesh rotation={[-Math.PI / 4, 0, 0]} position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]} position={[0.3, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      </group>

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#10b981" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#3b82f6" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
    </group>
  );
}

// Swap 3D Vector Scene
function Swap3DScene() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left coin */}
      <mesh position={[-1.2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color="#8b5cf6"
          metalness={0.8}
          roughness={0.2}
          emissive="#7c3aed"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Right coin */}
      <mesh position={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.2, 32]} />
        <meshStandardMaterial
          color="#ec4899"
          metalness={0.8}
          roughness={0.2}
          emissive="#db2777"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Left arrow */}
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Right arrow */}
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.2, 0.8, 8]} />
        <meshStandardMaterial color="#ec4899" />
      </mesh>

      {/* Connecting path */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[2, 0.1, 0.05]} />
        <meshStandardMaterial color="#a78bfa" opacity={0.5} transparent />
      </mesh>

      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-5, 5, 5]} intensity={0.8} color="#ec4899" />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
    </group>
  );
}

export function Wallet3D() {
  return (
    <div className="w-40 h-40 mx-auto relative">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl animate-pulse" />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <Wallet3DScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

export function Shield3D() {
  return (
    <div className="w-40 h-40 mx-auto relative">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl animate-pulse" />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <Shield3DScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

export function Swap3D() {
  return (
    <div className="w-40 h-40 mx-auto relative">
      <Suspense fallback={<div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-pulse" />}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.6} />
          <Swap3DScene />
        </Canvas>
      </Suspense>
    </div>
  );
}

