import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { CharacterKeyframe } from '../types/schema';

interface CharacterRigProps {
  state: CharacterKeyframe;
  isBystander?: boolean;
}

function createLimbGeometry(
  start: any,
  mid: any,
  end: any,
  radiusTop: number,
  radiusBottom: number
): any {
  const v1 = new THREE.Vector3().subVectors(start, mid).normalize().multiplyScalar(12);
  const pPre = new THREE.Vector3().addVectors(mid, v1);
  const v2 = new THREE.Vector3().subVectors(end, mid).normalize().multiplyScalar(12);
  const pPost = new THREE.Vector3().addVectors(mid, v2);

  const curve = new THREE.CatmullRomCurve3([start, pPre, mid, pPost, end]);
  return new THREE.TubeGeometry(curve, 20, (radiusTop + radiusBottom) / 2, 12, false);
}

export const CharacterRig: React.FC<CharacterRigProps> = ({ state, isBystander = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTime = frame / fps;

  const breathingOffset =
    state.freezeBreathing ? 0 : Math.sin(2 * Math.PI * 0.4 * currentTime) * 2.5;

  const clayMaterial = useMemo(() => {
    if (isBystander) {
      return new THREE.MeshStandardMaterial({
        color: '#475569',
        roughness: 0.85,
        metalness: 0.0,
        transparent: true,
        opacity: 0.7,
        toneMapped: true,
      });
    }
    return new THREE.MeshStandardMaterial({
      color: '#F8FAFC',
      roughness: 0.85,
      metalness: 0.0,
      emissive: new THREE.Color('#FFFFFF'),
      emissiveIntensity: 0.18,
      toneMapped: true,
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

  const armRightGeom = useMemo(() => {
    const start = new THREE.Vector3(26, 100, 0);
    const mid = new THREE.Vector3(
      26 + 60 * Math.sin(sRRoll) * Math.cos(sRPitch),
      100 - 60 * Math.cos(sRPitch),
      60 * Math.sin(sRPitch)
    );
    const end = new THREE.Vector3(
      mid.x + 60 * Math.sin(sRRoll + 0.1) * Math.cos(sRPitch + eRPitch),
      mid.y - 60 * Math.cos(sRPitch + eRPitch),
      mid.z + 60 * Math.sin(sRPitch + eRPitch)
    );
    return createLimbGeometry(start, mid, end, 8, 5);
  }, [sRPitch, sRYaw, sRRoll, eRPitch]);

  const armLeftGeom = useMemo(() => {
    const start = new THREE.Vector3(-26, 100, 0);
    const mid = new THREE.Vector3(
      -26 - 60 * Math.sin(-sLRoll) * Math.cos(sLPitch),
      100 - 60 * Math.cos(sLPitch),
      60 * Math.sin(sLPitch)
    );
    const end = new THREE.Vector3(
      mid.x - 60 * Math.sin(-sLRoll + 0.1) * Math.cos(sLPitch + eLPitch),
      mid.y - 60 * Math.cos(sLPitch + eLPitch),
      mid.z + 60 * Math.sin(sLPitch + eLPitch)
    );
    return createLimbGeometry(start, mid, end, 8, 5);
  }, [sLPitch, sLYaw, sLRoll, eLPitch]);

  const legRightGeom = useMemo(() => {
    const start = new THREE.Vector3(16, 0, 0);
    const mid = new THREE.Vector3(16, -80, 5);
    const end = new THREE.Vector3(16, -160, 0);
    return createLimbGeometry(start, mid, end, 10, 6);
  }, []);

  const legLeftGeom = useMemo(() => {
    const start = new THREE.Vector3(-16, 0, 0);
    const mid = new THREE.Vector3(-16, -80, 5);
    const end = new THREE.Vector3(-16, -160, 0);
    return createLimbGeometry(start, mid, end, 10, 6);
  }, []);

  return (
    <group position={[posX, posY, posZ]} rotation={[0, facingYaw, 0]} scale={[1.85, 1.85, 1.85]}>
      <mesh position={[0, 0, 0]} material={clayMaterial}>
        <cylinderGeometry args={[15, 14, 20, 16]} />
      </mesh>

      <group position={[0, 10, 0]} rotation={[spinePitch, spineYaw, spineRoll]}>
        <mesh position={[0, 30 + breathingOffset * 0.4, 0]} material={clayMaterial}>
          <cylinderGeometry args={[20, 15, 50, 16]} />
        </mesh>

        <group position={[0, breathingOffset, 0]}>
          <mesh position={[0, 75, 0]} material={clayMaterial}>
            <cylinderGeometry args={[25, 20, 45, 16]} />
          </mesh>

          <group position={[0, 100, 0]} rotation={[neckPitch, neckYaw, 0]}>
            <mesh position={[0, 6, 0]} material={clayMaterial}>
              <cylinderGeometry args={[8, 9, 12, 16]} />
            </mesh>

            <mesh position={[0, 30, 0]} material={clayMaterial}>
              <sphereGeometry args={[24, 32, 32]} />
            </mesh>
          </group>

          <mesh geometry={armRightGeom} material={clayMaterial} />
          <mesh geometry={armLeftGeom} material={clayMaterial} />
        </group>
      </group>

      <mesh geometry={legRightGeom} material={clayMaterial} />
      <mesh geometry={legLeftGeom} material={clayMaterial} />

      <mesh position={[16, -160, 8]} material={clayMaterial}>
        <boxGeometry args={[12, 6, 20]} />
      </mesh>
      <mesh position={[-16, -160, 8]} material={clayMaterial}>
        <boxGeometry args={[12, 6, 20]} />
      </mesh>
    </group>
  );
};
