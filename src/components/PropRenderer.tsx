import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { SymbolicPropEvent } from '../types/schema.js';

interface PropRendererProps {
  prop: SymbolicPropEvent;
}

export const PropRenderer: React.FC<PropRendererProps> = ({ prop }) => {
  if (prop.state === 'DESPAWN') return null;

  const targetCoords = prop.targetCoordinates || [0, 0, 0];
  const scale = prop.scaleMultiplier || 1.0;
  const color = prop.semanticColor || '#06B6D4';

  // Emissive Bloom Material (toneMapped: false to breach threshold 1.1)
  const emissiveMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: color,
      emissive: new THREE.Color(color),
      emissiveIntensity: 2.2,
      roughness: 0.25,
      metalness: 0.1,
      toneMapped: false, // Ensures pure Bloom glow
    });
  }, [color]);

  // Geometry for SVG Extrusion or Procedural Icon
  const geometry = useMemo(() => {
    if (prop.generationMethod === 'SVG_EXTRUSION' && prop.lucideIconName) {
      const icon = prop.lucideIconName;
      if (icon === 'lock') {
        const shape = new THREE.Shape();
        shape.moveTo(-15, -15);
        shape.lineTo(15, -15);
        shape.lineTo(15, 12);
        shape.lineTo(-15, 12);
        shape.closePath();
        const extrude = new THREE.ExtrudeGeometry(shape, {
          depth: 10,
          bevelEnabled: true,
          bevelThickness: 3,
          bevelSize: 2,
          bevelSegments: 4,
        });
        extrude.center();
        return extrude;
      } else if (icon === 'unlock') {
        const shape = new THREE.Shape();
        shape.moveTo(-15, -15);
        shape.lineTo(15, -15);
        shape.lineTo(15, 12);
        shape.lineTo(-15, 12);
        shape.closePath();
        const extrude = new THREE.ExtrudeGeometry(shape, {
          depth: 10,
          bevelEnabled: true,
          bevelThickness: 3,
          bevelSize: 2,
          bevelSegments: 4,
        });
        extrude.center();
        return extrude;
      } else if (icon === 'key') {
        const shape = new THREE.Shape();
        shape.absarc(0, 18, 12, 0, Math.PI * 2, false);
        const extrude = new THREE.ExtrudeGeometry(shape, {
          depth: 8,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1.5,
          bevelSegments: 3,
        });
        extrude.center();
        return extrude;
      } else if (icon === 'copy') {
        const shape = new THREE.Shape();
        shape.moveTo(-14, -18);
        shape.lineTo(14, -18);
        shape.lineTo(14, 18);
        shape.lineTo(-14, 18);
        shape.closePath();
        const extrude = new THREE.ExtrudeGeometry(shape, {
          depth: 6,
          bevelEnabled: true,
          bevelThickness: 2,
          bevelSize: 1,
          bevelSegments: 3,
        });
        extrude.center();
        return extrude;
      }
    }

    const box = new THREE.BoxGeometry(35, 35, 12);
    box.center();
    return box;
  }, [prop.generationMethod, prop.lucideIconName]);

  return (
    <group
      position={[targetCoords[0], targetCoords[1], targetCoords[2]]}
      scale={[scale * 1.5, scale * 1.5, scale * 1.5]}
    >
      <mesh geometry={geometry} material={emissiveMaterial} />
      {/* Soft localized point light to cast gentle glow on surroundings */}
      <pointLight color={color} intensity={1.8} distance={140} decay={2} />
    </group>
  );
};
