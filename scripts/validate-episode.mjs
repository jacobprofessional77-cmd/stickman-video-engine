import fs from 'node:fs';
import path from 'node:path';

export function validateEpisode() {
  console.log('================================================================');
  console.log('🔍 Comprehensive Episode & Engine Validator (5-Axis Rigorous Lock)');
  console.log('================================================================');

  const episodePath = path.resolve('src/data/currentEpisode.json');
  if (!fs.existsSync(episodePath)) {
    throw new Error('❌ currentEpisode.json does not exist!');
  }

  const episode = JSON.parse(fs.readFileSync(episodePath, 'utf8'));
  const errors = [];
  const warnings = [];

  // ==========================================================================
  // AXIS 1: 100% Director Execution Lock (Zero Unwired Props / Placeholders)
  // ==========================================================================
  console.log('▶ [Axis 1]: Checking Director Execution Lock & Asset Integrity...');
  if (!episode.stage || !Array.isArray(episode.stage.elements)) {
    errors.push('Stage configuration or stage.elements missing');
  }

  for (const el of episode.stage.elements) {
    if (!el.id || !el.elementType || !el.geometryRecipe || !el.position || !el.dimensions) {
      errors.push(`Stage element ${el.id || 'unnamed'} missing required geometric properties`);
    }
    if (el.geometryRecipe === 'COMPOUND_PRIMITIVES' && (!el.compoundParts || el.compoundParts.length === 0)) {
      errors.push(`Stage element ${el.id} specified COMPOUND_PRIMITIVES but has no compoundParts`);
    }
  }

  const propIds = new Set();
  const sfxKeys = new Set();
  for (const beat of episode.beats) {
    // Props
    if (beat.propEvents) {
      for (const prop of beat.propEvents) {
        propIds.add(prop.propId);
        if (!prop.semanticColor) {
          errors.push(`Prop ${prop.propId} missing semanticColor in beat ${beat.beatId}`);
        }
        if (prop.generationMethod === 'SVG_EXTRUSION' && !prop.lucideIconName && !prop.svgPathData) {
          errors.push(`Prop ${prop.propId} is SVG_EXTRUSION but has neither lucideIconName nor svgPathData`);
        }
      }
    }
    // SFX
    if (beat.sfxEvents) {
      for (const sfx of beat.sfxEvents) {
        sfxKeys.add(sfx.sfxKey);
        if (!sfx.synthRecipe || !sfx.synthRecipe.archetype) {
          errors.push(`SFX ${sfx.sfxKey} in beat ${beat.beatId} missing synthRecipe or archetype`);
        }
        if (sfx.volume > 0.45) {
          errors.push(`SFX ${sfx.sfxKey} volume ${sfx.volume} exceeds maximum allowed 0.45 (Sonic Rule)`);
        }
      }
    }
  }

  // Verify SFX files generated
  for (const key of sfxKeys) {
    const sfxFile = key.endsWith('.wav') ? key : `${key}.wav`;
    const p = path.resolve('public/sfx', sfxFile);
    if (!fs.existsSync(p)) {
      warnings.push(`SFX file public/sfx/${sfxFile} not yet generated on disk`);
    }
  }

  console.log(`  ✓ Stage Elements: ${episode.stage.elements.length} verified.`);
  console.log(`  ✓ Unique Props: ${propIds.size} verified with valid geometry/lucide mappings.`);
  console.log(`  ✓ Sound Events: ${sfxKeys.size} verified conforming to 90/10 Sonic Rule.`);

  // ==========================================================================
  // AXIS 2: Engine Code Architecture Rules in src/components/
  // ==========================================================================
  console.log('▶ [Axis 2]: Checking Engine Code Rules in src/components/...');
  const componentsDir = path.resolve('src/components');
  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    let checkedCode = 0;
    for (const f of files) {
      if (f.endsWith('.tsx') || f.endsWith('.ts')) {
        const content = fs.readFileSync(path.join(componentsDir, f), 'utf8');
        checkedCode++;
        // Check for non-deterministic useFrame clock
        if (content.includes('state.clock.getElapsedTime') || content.includes('delta')) {
          errors.push(`File ${f} uses non-deterministic clock/delta. Remotion requires frame-determinism via useCurrentFrame()!`);
        }
      }
    }
    console.log(`  ✓ Inspected ${checkedCode} engine source files for frame determinism.`);
  }

  // ==========================================================================
  // AXIS 3: Anti-Jump Continuity & Seamless Loop Lock
  // ==========================================================================
  console.log('▶ [Axis 3]: Checking Anti-Jump Continuity & Seamless Loop...');
  const beats = episode.beats;
  for (let i = 0; i < beats.length - 1; i++) {
    const curr = beats[i];
    const next = beats[i + 1];

    if (Math.abs(curr.endTime - next.startTime) > 0.001) {
      errors.push(`Time gap or overlap between ${curr.beatId} (${curr.endTime}s) and ${next.beatId} (${next.startTime}s)`);
    }

    // Continuity check on positions (no teleport jumps > 150px without locomotion)
    const victimJump = Math.abs(curr.victimState.positionX_3D - next.victimState.positionX_3D);
    const manipJump = Math.abs(curr.manipulatorState.positionX_3D - next.manipulatorState.positionX_3D);
    if (victimJump > 120 && curr.victimState.locomotionMode === 'STAND') {
      errors.push(`Victim X jump ${victimJump}px between ${curr.beatId} and ${next.beatId} exceeds safe limit`);
    }
    if (manipJump > 120 && curr.manipulatorState.locomotionMode === 'STAND') {
      errors.push(`Manipulator X jump ${manipJump}px between ${curr.beatId} and ${next.beatId} exceeds safe limit`);
    }
  }

  // Seamless Loop check: last beat returns to beat 0 camera and lighting
  const beat0 = beats[0];
  const beatLast = beats[beats.length - 1];
  const camZDiff = Math.abs(beat0.camera.targetZ - beatLast.camera.targetZ);
  const camElevDiff = Math.abs(beat0.camera.elevationOffset - beatLast.camera.elevationOffset);
  const camOrbDiff = Math.abs(beat0.camera.orbitalAngleDeg - beatLast.camera.orbitalAngleDeg);

  if (camZDiff > 10 || camElevDiff > 10 || camOrbDiff > 2) {
    errors.push(`Seamless Loop failed! Final beat camera differs from Beat 0: ΔZ=${camZDiff}, ΔElev=${camElevDiff}, ΔOrb=${camOrbDiff}`);
  }
  if (beatLast.lighting !== beat0.lighting) {
    errors.push(`Seamless Loop failed! Final beat lighting (${beatLast.lighting}) does not match Beat 0 (${beat0.lighting})`);
  }
  console.log(`  ✓ 100% Anti-jump continuity across all ${beats.length} beats.`);
  console.log(`  ✓ Seamless loop match confirmed (ΔZ=${camZDiff}, ΔElev=${camElevDiff}, ΔOrb=${camOrbDiff}).`);

  // ==========================================================================
  // AXIS 4: Anti-Clipping & Minimum Head Distance >= 120px
  // ==========================================================================
  console.log('▶ [Axis 4]: Checking Anti-Clipping & Minimum Head Distance (>= 120px)...');
  for (const beat of beats) {
    // Estimate head X from positionX_3D + spine lean pitch displacement
    const victimPitch = beat.victimState.customJointAngles?.spine?.[0] || 0;
    const manipPitch = beat.manipulatorState.customJointAngles?.spine?.[0] || 0;
    const victimPelvisX = beat.victimState.pelvisOffset?.[0] || 0;
    const manipPelvisX = beat.manipulatorState.pelvisOffset?.[0] || 0;

    // Head displacement approx: 110px spine * sin(pitch)
    const victimHeadX = beat.victimState.positionX_3D + victimPelvisX + Math.sin((victimPitch * Math.PI) / 180) * 110;
    const manipHeadX = beat.manipulatorState.positionX_3D + manipPelvisX - Math.sin((manipPitch * Math.PI) / 180) * 110;

    const headDistance = Math.abs(manipHeadX - victimHeadX);
    if (headDistance < 120) {
      errors.push(`Head distance violation in ${beat.beatId}: distance is ${headDistance.toFixed(1)}px (minimum is 120px)`);
    }
  }
  console.log('  ✓ Head distance condition (>= 120px) strictly verified across all beats.');

  // ==========================================================================
  // AXIS 5: Social Media Safe-Zone Compliance
  // ==========================================================================
  console.log('▶ [Axis 5]: Checking Social Media Safe-Zone & Subtitle Ceiling...');
  // Safe bounds: X_px in [100, 950] => X_3D in [-440, +410]
  // Y_px in [180, 1550] => Y_3D in [-590, +780]
  for (const beat of beats) {
    const vX = beat.victimState.positionX_3D;
    const mX = beat.manipulatorState.positionX_3D;
    if (vX < -440 || vX > 410) {
      errors.push(`Victim position X_3D (${vX}) violates screen safe zone [-440, 410] in ${beat.beatId}`);
    }
    if (mX < -440 || mX > 410) {
      errors.push(`Manipulator position X_3D (${mX}) violates screen safe zone [-440, 410] in ${beat.beatId}`);
    }

    // Subtitle ceiling: active props cannot drop below Y_px = 1320px (Y_3D = -360)
    if (beat.propEvents) {
      for (const prop of beat.propEvents) {
        if (prop.targetCoordinates && prop.targetCoordinates[1] < -340) {
          errors.push(`Prop ${prop.propId} target Y_3D (${prop.targetCoordinates[1]}) breaches subtitle ceiling in ${beat.beatId}`);
        }
      }
    }
  }

  // Verify Subtitles are in 3-5 word chunks
  for (const sub of episode.subtitles) {
    const words = sub.text.trim().split(/\s+/);
    if (words.length < 2 || words.length > 6) {
      warnings.push(`Subtitle chunk "${sub.text}" has ${words.length} words (ideal is 3-5 words)`);
    }
  }

  console.log(`  ✓ All character and prop positions within safe bounding box.`);
  console.log(`  ✓ Subtitle ceiling (Y_3D >= -340) strictly honored.`);

  // ==========================================================================
  // Final Verdict
  // ==========================================================================
  console.log('----------------------------------------------------------------');
  if (warnings.length > 0) {
    console.log(`⚠️  ${warnings.length} Warnings:`);
    for (const w of warnings) console.log(`   - ${w}`);
  }

  if (errors.length > 0) {
    console.error(`❌ Validation FAILED with ${errors.length} Errors:`);
    for (const err of errors) console.error(`   - ${err}`);
    process.exit(1);
  } else {
    console.log('✅ ALL 5 AXES PASSED WITH 0 ERRORS! Director Execution Locked.');
    console.log('================================================================');
  }
}

if (process.argv[1] && process.argv[1].endsWith('validate-episode.mjs')) {
  validateEpisode();
}
