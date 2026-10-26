import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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

  const ease =
    currentBeat.camera.transitionCurve === 'WHIP_ZOOM_IN'
      ? Math.pow(beatProgress, 3)
      : 0.5 * (1 - Math.cos(Math.PI * beatProgress));

  const targetZ = currentBeat.camera.targetZ + (nextBeat.camera.targetZ - currentBeat.camera.targetZ) * ease * 0.15;
  const panX = (currentBeat.camera.panX || 0) + ((nextBeat.camera.panX || 0) - (currentBeat.camera.panX || 0)) * ease * 0.15;
  const elev = currentBeat.camera.elevationOffset + (nextBeat.camera.elevationOffset - currentBeat.camera.elevationOffset) * ease * 0.15;
  const orbital = (currentBeat.camera.orbitalAngleDeg || 0) * (Math.PI / 180);
  const tilt = (currentBeat.camera.dutchTiltDeg || 0) * (Math.PI / 180);

  const posX = panX + Math.sin(orbital) * targetZ;
  const posY = elev;
  const posZ = Math.cos(orbital) * targetZ;

  camera.position.set(posX, posY, posZ);
  camera.lookAt(panX, 0, 0);
  camera.rotation.z = tilt;

  return null;
};

const DepthParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const count = 40;

  const particles = React.useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const baseX = ((i * 47) % 800) - 400;
      const baseY = ((i * 31) % 600) - 200;
      const baseZ = ((i * 59) % 600) - 300;
      list.push({ baseX, baseY, baseZ, speed: 0.4 + (i % 5) * 0.15 });
    }
    return list;
  }, []);

  return (
    <group>
      {particles.map((p, idx) => {
        const y = p.baseY + Math.sin((frame * 0.04 * p.speed) + idx) * 15;
        const x = p.baseX + Math.cos((frame * 0.03 * p.speed) + idx) * 10;
        return (
          <mesh key={idx} position={[x, y, p.baseZ]}>
            <sphereGeometry args={[1.8, 8, 8]} />
            <meshBasicMaterial {...({ color: '#94A3B8', transparent: true, opacity: 0.12 } as any)} />
          </mesh>
        );
      })}
    </group>
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
        dpr={1}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 90, 2100], fov: 38, near: 10, far: 8000 }}
      >
        <CameraController beats={beats} />

        <color attach="background" args={[stage.atmospherePalette?.topSkyHex || '#0B0F19']} />
        <fog attach="fog" args={[stage.atmospherePalette?.horizonHex || '#161F33', 1800, 5500]} />

        {stage.showAmbientMoon && (
          <group position={[0, 480, -900]}>
            <mesh>
              <sphereGeometry args={[75, 32, 32]} />
              <meshBasicMaterial {...({ color: '#E2E8F0', transparent: true, opacity: 0.65 } as any)} />
            </mesh>
            <pointLight color="#E2E8F0" intensity={0.4} distance={900} />
          </group>
        )}

        <ambientLight intensity={isDanger ? 0.25 : 0.65} color="#94A3B8" />

        <directionalLight
          position={[-400, 600, 400]}
          intensity={isDanger ? 0.4 : 1.1}
          color="#FFF7ED"
        />

        <directionalLight
          position={[400, 300, 200]}
          intensity={isDanger ? 0.15 : 0.25}
          color="#CBD5E1"
        />

        <directionalLight
          position={[0, 400, -500]}
          intensity={isDanger ? 1.4 : 0.8}
          color={isDanger ? '#F59E0B' : '#38BDF8'}
        />

        {isDanger && (
          <spotLight
            position={[0, 700, 0]}
            target-position={[0, -100, 0]}
            intensity={2.8}
            angle={0.6}
            penumbra={0.5}
            color="#FEF3C7"
          />
        )}

        <mesh position={[0, -340, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2600, 2600]} />
          <MeshReflectorMaterial
            {...({
              blur: [150, 40],
              resolution: 1024,
              mirror: stage.floorReflectivity || 0.6,
              mixBlur: 0.7,
              mixStrength: 1.5,
              roughness: 0.6,
              depthScale: 1.2,
              minDepthThreshold: 0.4,
              maxDepthThreshold: 1.4,
              color: stage.atmospherePalette?.floorHex || '#0D1322',
              metalness: 0.2,
            } as any)}
          />
        </mesh>

        <ContactShadows
          position={[0, -339.5, 0]}
          opacity={0.45}
          scale={700}
          blur={2.5}
          far={120}
        />

        {stage.elements.map((el) => {
          if (el.geometryRecipe === 'COMPOUND_PRIMITIVES' && el.compoundParts) {
            return (
              <group key={el.id} position={el.position}>
                {el.compoundParts.map((part, pIdx) => (
                  <mesh key={pIdx} position={part.offset} rotation={part.rotationDeg ? [part.rotationDeg[0]*(Math.PI/180), part.rotationDeg[1]*(Math.PI/180), part.rotationDeg[2]*(Math.PI/180)] : [0,0,0]}>
                    <boxGeometry args={part.size} />
                    <meshStandardMaterial
                      {...({
                        color: el.color || '#1E293B',
                        roughness: 0.75,
                        metalness: 0.1,
                      } as any)}
                    />
                  </mesh>
                ))}
              </group>
            );
          }
          return (
            <mesh key={el.id} position={el.position}>
              <boxGeometry args={el.dimensions} />
              <meshStandardMaterial
                {...({
                  color: el.color || '#06B6D4',
                  emissive: el.emissiveGlow ? new THREE.Color(el.color || '#06B6D4') : undefined,
                  emissiveIntensity: el.emissiveGlow ? 1.5 : 0,
                  roughness: 0.3,
                } as any)}
              />
            </mesh>
          );
        })}

        <CharacterRig state={activeBeat.victimState} isBystander={false} />
        <CharacterRig state={activeBeat.manipulatorState} isBystander={false} />

        {stage.bystanderPositions &&
          stage.bystanderPositions.map((pos, bIdx) => (
            <group key={bIdx} position={pos}>
              <CharacterRig
                state={{
                  pose: 'IDLE_NEUTRAL',
                  positionX_3D: 0,
                  positionY_3D: 0,
                  positionZ_3D: 0,
                }}
                isBystander={true}
              />
            </group>
          ))}

        {activeBeat.propEvents &&
          activeBeat.propEvents.map((prop) => (
            <PropRenderer key={prop.propId} prop={prop} />
          ))}

        <DepthParticles />

        <EffectComposer multisampling={8}>
          <Bloom
            luminanceThreshold={1.1}
            mipmapBlur
            intensity={0.85}
            radius={0.6}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};
