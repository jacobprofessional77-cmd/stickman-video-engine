import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { CharacterKeyframe } from '../types/schema';

interface CharacterRigProps {
  state: CharacterKeyframe;
  isBystander?: boolean;
}

export const CharacterRig: React.FC<CharacterRigProps> = ({ state, isBystander = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const breathing = state.freezeBreathing ? 0 : Math.sin(2 * Math.PI * 0.4 * currentTime) * 1.8;

  // Premium Pathlight Visuals Soft Clay Material
  const clayMaterial = useMemo(() => {
    if (isBystander) {
      return new THREE.MeshStandardMaterial({
        color: '#334155',
        roughness: 0.85,
        metalness: 0.0,
        transparent: true,
        opacity: 0.45,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.55,
      metalness: 0.05,
      emissive: new THREE.Color('#FFFFFF'),
      emissiveIntensity: 0.08,
    });
  }, [isBystander]);

  const jointMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isBystander ? '#1E293B' : '#E2E8F0',
      roughness: 0.6,
      metalness: 0.05,
    });
  }, [isBystander]);

  const angles = state.customJointAngles || {};
  const spinePitch = (angles.spine?.[0] || 0) * (Math.PI / 180);
  const spineYaw = (angles.spine?.[1] || 0) * (Math.PI / 180);
  const spineRoll = (angles.spine?.[2] || 0) * (Math.PI / 180);

  const neckPitch = (angles.neck?.[0] || 0) * (Math.PI / 180);
  const neckYaw = (angles.neck?.[1] || 0) * (Math.PI / 180);

  const sRPitch = (angles.shoulderR?.[0] || 0) * (Math.PI / 180);
  const sRYaw = (angles.shoulderR?.[1] || 0) * (Math.PI / 180);
  const sRRoll = (angles.shoulderR?.[2] || 0) * (Math.PI / 180);

  const sLPitch = (angles.shoulderL?.[0] || 0) * (Math.PI / 180);
  const sLYaw = (angles.shoulderL?.[1] || 0) * (Math.PI / 180);
  const sLRoll = (angles.shoulderL?.[2] || 0) * (Math.PI / 180);

  const eRPitch = (angles.elbowR?.[0] || 0) * (Math.PI / 180);
  const eLPitch = (angles.elbowL?.[0] || 0) * (Math.PI / 180);

  const posX = state.positionX_3D + (state.pelvisOffset?.[0] || 0);
  const posY = state.positionY_3D + (state.pelvisOffset?.[1] || 0);
  const posZ = (state.positionZ_3D || 0) + (state.pelvisOffset?.[2] || 0);
  const facingYaw = (state.facingYawDeg || 0) * (Math.PI / 180);

  return (
    <group position={[posX, posY, posZ]} rotation={[0, facingYaw, 0]} scale={[1.7, 1.7, 1.7]}>
      {/* Pelvis & Hips */}
      <mesh position={[0, 160, 0]} material={clayMaterial}>
        <cylinderGeometry args={[14, 11, 18, 24]} />
      </mesh>
      <mesh position={[0, 152, 0]} material={jointMaterial}>
        <sphereGeometry args={[11, 20, 20]} />
      </mesh>

      {/* Flexible Articulated Spine */}
      <group position={[0, 168, 0]} rotation={[spinePitch, spineYaw, spineRoll]}>
        {/* Lower Abdomen */}
        <mesh position={[0, 16, 0]} material={clayMaterial}>
          <cylinderGeometry args={[15, 13, 24, 24]} />
        </mesh>

        {/* Chest with Breathing Dynamics */}
        <group position={[0, 32 + breathing, 0]}>
          <mesh position={[0, 18, 0]} material={clayMaterial}>
            <cylinderGeometry args={[20, 15, 34, 24]} />
          </mesh>

          {/* Neck & Pure Smooth Sphere Head */}
          <group position={[0, 36, 0]} rotation={[neckPitch, neckYaw, 0]}>
            <mesh position={[0, 6, 0]} material={clayMaterial}>
              <cylinderGeometry args={[6.5, 8, 14, 20]} />
            </mesh>
            <mesh position={[0, 26, 0]} material={clayMaterial}>
              <sphereGeometry args={[19, 36, 36]} />
            </mesh>
          </group>

          {/* Right Arm */}
          <group position={[23, 28, 0]} rotation={[sRPitch, sRYaw, sRRoll]}>
            <mesh position={[0, 0, 0]} material={jointMaterial}>
              <sphereGeometry args={[6.2, 18, 18]} />
            </mesh>
            <mesh position={[0, -25, 0]} material={clayMaterial}>
              <cylinderGeometry args={[5.2, 4.2, 50, 18]} />
            </mesh>
            {/* Right Elbow & Forearm */}
            <group position={[0, -50, 0]} rotation={[eRPitch, 0, 0]}>
              <mesh position={[0, 0, 0]} material={jointMaterial}>
                <sphereGeometry args={[4.4, 16, 16]} />
              </mesh>
              <mesh position={[0, -22, 0]} material={clayMaterial}>
                <cylinderGeometry args={[4.2, 3.2, 44, 18]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -46, 0]} material={clayMaterial}>
                <sphereGeometry args={[3.8, 16, 16]} />
              </mesh>
            </group>
          </group>

          {/* Left Arm */}
          <group position={[-23, 28, 0]} rotation={[sLPitch, sLYaw, sLRoll]}>
            <mesh position={[0, 0, 0]} material={jointMaterial}>
              <sphereGeometry args={[6.2, 18, 18]} />
            </mesh>
            <mesh position={[0, -25, 0]} material={clayMaterial}>
              <cylinderGeometry args={[5.2, 4.2, 50, 18]} />
            </mesh>
            {/* Left Elbow & Forearm */}
            <group position={[0, -50, 0]} rotation={[eLPitch, 0, 0]}>
              <mesh position={[0, 0, 0]} material={jointMaterial}>
                <sphereGeometry args={[4.4, 16, 16]} />
              </mesh>
              <mesh position={[0, -22, 0]} material={clayMaterial}>
                <cylinderGeometry args={[4.2, 3.2, 44, 18]} />
              </mesh>
              {/* Hand */}
              <mesh position={[0, -46, 0]} material={clayMaterial}>
                <sphereGeometry args={[3.8, 16, 16]} />
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {/* Legs (Anchored to Floor at Y = 0) */}
      {/* Right Leg */}
      <group position={[12, 150, 0]}>
        <mesh position={[0, 0, 0]} material={jointMaterial}>
          <sphereGeometry args={[7.2, 18, 18]} />
        </mesh>
        <mesh position={[0, -36, 0]} material={clayMaterial}>
          <cylinderGeometry args={[7.2, 5.2, 72, 18]} />
        </mesh>
        {/* Knee & Shin */}
        <group position={[0, -72, 0]}>
          <mesh position={[0, 0, 0]} material={jointMaterial}>
            <sphereGeometry args={[5.5, 16, 16]} />
          </mesh>
          <mesh position={[0, -36, 0]} material={clayMaterial}>
            <cylinderGeometry args={[5.2, 3.8, 72, 18]} />
          </mesh>
          {/* Foot flat on floor */}
          <mesh position={[0, -74, 5]} material={clayMaterial}>
            <boxGeometry args={[9, 5, 20]} />
          </mesh>
        </group>
      </group>

      {/* Left Leg */}
      <group position={[-12, 150, 0]}>
        <mesh position={[0, 0, 0]} material={jointMaterial}>
          <sphereGeometry args={[7.2, 18, 18]} />
        </mesh>
        <mesh position={[0, -36, 0]} material={clayMaterial}>
          <cylinderGeometry args={[7.2, 5.2, 72, 18]} />
        </mesh>
        {/* Knee & Shin */}
        <group position={[0, -72, 0]}>
          <mesh position={[0, 0, 0]} material={jointMaterial}>
            <sphereGeometry args={[5.5, 16, 16]} />
          </mesh>
          <mesh position={[0, -36, 0]} material={clayMaterial}>
            <cylinderGeometry args={[5.2, 3.8, 72, 18]} />
          </mesh>
          {/* Foot flat on floor */}
          <mesh position={[0, -74, 5]} material={clayMaterial}>
            <boxGeometry args={[9, 5, 20]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
