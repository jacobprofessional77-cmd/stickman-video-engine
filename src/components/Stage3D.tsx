import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { SceneBeat, StageConfig } from '../types/schema';
import { CharacterRig } from './CharacterRig';
import { PropRenderer } from './PropRenderer';

interface Stage3DProps {
  stage: StageConfig;
  beats: SceneBeat[];
}

const CameraController: React.FC<{ beats: SceneBeat[] }> = ({ beats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;
  const { camera } = useThree();

  let beatIndex = beats.findIndex(
    (b) => currentTime >= b.startTime && currentTime <= b.endTime
  );
  if (beatIndex === -1) beatIndex = beats.length - 1;

  const currentBeat = beats[beatIndex];
  const nextBeat = beats[Math.min(beatIndex + 1, beats.length - 1)];

  const beatProgress = Math.max(
    0,
    Math.min(1, (currentTime - currentBeat.startTime) / Math.max(0.01, currentBeat.endTime - currentBeat.startTime))
  );

  // Smooth cubic ease transition between beats
  const ease = 0.5 * (1 - Math.cos(Math.PI * beatProgress));

  // Natural 3D orbital camera placement (avoiding dead flat 2D angles)
  const targetZ = currentBeat.camera.targetZ + (nextBeat.camera.targetZ - currentBeat.camera.targetZ) * ease;
  const panX = (currentBeat.camera.panX || 0) + ((nextBeat.camera.panX || 0) - (currentBeat.camera.panX || 0)) * ease;
  const elev = (currentBeat.camera.elevationOffset || 60) + ((nextBeat.camera.elevationOffset || 60) - (currentBeat.camera.elevationOffset || 60)) * ease;
  
  // Cinematic 12-degree orbital angle for 3D depth
  const orbitalDeg = (currentBeat.camera.orbitalAngleDeg ?? 12) + ((nextBeat.camera.orbitalAngleDeg ?? 12) - (currentBeat.camera.orbitalAngleDeg ?? 12)) * ease;
  const orbitalRad = orbitalDeg * (Math.PI / 180);

  const posX = panX + Math.sin(orbitalRad) * targetZ;
  const posY = elev;
  const posZ = Math.cos(orbitalRad) * targetZ;

  camera.position.set(posX, posY, posZ);
  camera.lookAt(panX, -120, 0);

  return null;
};

// Subtle atmospheric depth particles
const DepthParticles: React.FC = () => {
  const count = 30;
  const positions = React.useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = ((i * 53) % 900) - 450;
      pos[i * 3 + 1] = ((i * 37) % 500) - 150;
      pos[i * 3 + 2] = ((i * 67) % 700) - 350;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        {...({
          size: 3.0,
          color: '#94A3B8',
          transparent: true,
          opacity: 0.18,
          sizeAttenuation: true,
        } as any)}
      />
    </points>
  );
};

export const Stage3D: React.FC<Stage3DProps> = ({ stage, beats }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  let activeBeat = beats.find(
    (b) => currentTime >= b.startTime && currentTime <= b.endTime
  );
  if (!activeBeat) activeBeat = beats[beats.length - 1];

  const isDanger = activeBeat.lighting === 'DANGER_REVEAL';

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        frameloop="always"
        dpr={1}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 60, 1800], fov: 38, near: 10, far: 8000 }}
      >
        <CameraController beats={beats} />

        {/* Cinematic Deep Dusk Atmosphere */}
        <color attach="background" args={['#080C16']} />
        <fog attach="fog" args={['#0F172A', 1900, 5200]} />

        {/* 3-Point Cinematic Lighting Pipeline */}
        <ambientLight intensity={isDanger ? 0.35 : 0.65} color="#94A3B8" />

        {/* Key Light (Warm Sunlight / High Front-Left) */}
        <directionalLight
          position={[-350, 550, 400]}
          intensity={isDanger ? 0.6 : 1.25}
          color="#FFF7ED"
        />

        {/* Soft Cool Fill Light (Front-Right) */}
        <directionalLight
          position={[400, 250, 250]}
          intensity={0.35}
          color="#CBD5E1"
        />

        {/* Dramatic Golden Rim Light (Back-Top) - Creates the Pathlight Visuals Silhouette */}
        <directionalLight
          position={[0, 450, -450]}
          intensity={isDanger ? 2.4 : 1.9}
          color={isDanger ? '#F59E0B' : '#E0E7FF'}
        />

        {isDanger && (
          <spotLight
            position={[0, 650, 0]}
            target-position={[0, -100, 0]}
            intensity={2.5}
            angle={0.55}
            penumbra={0.6}
            color="#FEF3C7"
          />
        )}

        {/* Luxurious Polished Obsidian Stage Floor */}
        <mesh position={[0, -340, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3000, 3000]} />
          <meshStandardMaterial
            {...({
              color: '#090D18',
              roughness: 0.25,
              metalness: 0.6,
            } as any)}
          />
        </mesh>

        {/* Soft Ground Contact Shadow */}
        <ContactShadows
          position={[0, -339.5, 0]}
          opacity={0.4}
          scale={850}
          blur={2.5}
          far={140}
          frames={1}
        />

        {/* Sleek Minimalist Architectural Desk (Waist Level, Elegant & Non-Obtrusive) */}
        <group position={[0, -170, 0]}>
          {/* Desk Top */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[420, 10, 110]} />
            <meshStandardMaterial
              {...({
                color: '#1E293B',
                roughness: 0.5,
                metalness: 0.3,
              } as any)}
            />
          </mesh>
          {/* Subtle Glowing Center Accent Line */}
          <mesh position={[0, 5.2, 0]}>
            <boxGeometry args={[4, 1, 108]} />
            <meshStandardMaterial
              {...({
                color: '#38BDF8',
                emissive: new THREE.Color('#38BDF8'),
                emissiveIntensity: 1.5,
              } as any)}
            />
          </mesh>
          {/* Thin Elegant Desk Legs */}
          <mesh position={[-195, -80, 0]}>
            <boxGeometry args={[8, 160, 90]} />
            <meshStandardMaterial
              {...({
                color: '#0F172A',
                roughness: 0.7,
                metalness: 0.2,
              } as any)}
            />
          </mesh>
          <mesh position={[195, -80, 0]}>
            <boxGeometry args={[8, 160, 90]} />
            <meshStandardMaterial
              {...({
                color: '#0F172A',
                roughness: 0.7,
                metalness: 0.2,
              } as any)}
            />
          </mesh>
        </group>

        {/* Main Characters */}
        <CharacterRig state={activeBeat.victimState} isBystander={false} />
        <CharacterRig state={activeBeat.manipulatorState} isBystander={false} />

        {/* Symbolic Hand-held Props (Cleanly Scaled, Zero Visual Clutter) */}
        {activeBeat.propEvents &&
          activeBeat.propEvents.map((prop) => (
            <PropRenderer key={prop.propId} prop={prop} />
          ))}

        <DepthParticles />
      </Canvas>
    </div>
  );
};
