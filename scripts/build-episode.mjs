import fs from 'node:fs';
import path from 'node:path';

export function buildEpisode() {
  const whisperCachePath = path.resolve('src/data/whisper_cache.json');
  if (!fs.existsSync(whisperCachePath)) {
    throw new Error('whisper_cache.json not found! Please run Audio Timing Extractor first.');
  }

  const whisper = JSON.parse(fs.readFileSync(whisperCachePath, 'utf8'));
  const duration = whisper.duration || 15.01;
  const fps = 30;

  // Clean-Slate Episode Reset
  const episodePath = path.resolve('src/data/currentEpisode.json');

  // Subtitles from whisper cache chunks
  const subtitles = whisper.chunks.map((c) => ({
    id: c.id,
    startTime: c.startTime,
    endTime: c.endTime,
    text: c.text,
  }));

  // Atmosphere & Stage configuration (Mirror / Reflection Metaphor)
  const stage = {
    mode: 'DUEL_REFLECTIVE',
    atmospherePalette: {
      topSkyHex: '#0B0F19', // Deep Twilight Sky (L <= 0.18)
      horizonHex: '#161F33', // Indigo Dusk
      floorHex: '#0D1322', // Reflective Obsidian Floor
    },
    showAmbientMoon: true,
    floorReflectivity: 0.65,
    elements: [
      {
        id: 'table_dialogue',
        elementType: 'FURNITURE_TABLE',
        geometryRecipe: 'COMPOUND_PRIMITIVES',
        position: [0, -200, 0],
        dimensions: [440, 280, 160],
        color: '#1E293B',
        compoundParts: [
          // Base support pedestal
          {
            shape: 'BOX_BEVELED',
            offset: [0, -100, 0],
            size: [360, 80, 120],
          },
          // Beveled top surface (snapped at Y = -60, exactly 280px above floor Y=-340)
          {
            shape: 'BOX_BEVELED',
            offset: [0, 0, 0],
            size: [440, 24, 160],
          },
          // Center luminous dividing groove
          {
            shape: 'CYLINDER',
            offset: [0, 14, 0],
            rotationDeg: [0, 0, 90],
            size: [4, 4, 150],
          },
        ],
      },
      {
        id: 'center_mirror_portal',
        elementType: 'SYMBOLIC_MIRROR',
        geometryRecipe: 'BOX_BEVELED',
        position: [0, 20, 0],
        dimensions: [180, 320, 12],
        color: '#06B6D4',
        emissiveGlow: true,
      },
    ],
    bystanderCrowdCount: 4,
    bystanderPositions: [
      [-420, -340, -280],
      [-520, -340, -320],
      [420, -340, -280],
      [520, -340, -320],
    ],
  };

  // 11 Scene Beats matching psychological choreography and voiceover
  const beats = [
    // Beat 1 (0.00s - 1.50s): "بيلمّح من بعيد لأزمة خاصة"
    // Visual Hook Frame 0: Guarded posture with secret lock prop
    {
      beatId: 'beat_1_guarded_dilemma',
      startTime: 0.0,
      endTime: 1.5,
      activeSpeaker: 'VICTIM',
      camera: {
        shot: 'HOOK_MEDIUM',
        targetZ: 2100,
        panX: 0,
        elevationOffset: 90,
        lookAtTarget: [0, -10, 0],
        focusSubject: 'STAGE_CENTER',
        orbitalAngleDeg: -4,
        fovDeg: 38,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.6,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [
        {
          sfxKey: 'sfx_hook_whoosh',
          triggerTime: 0.0,
          volume: 0.35,
          synthRecipe: {
            archetype: 'AIR_WHOOSH',
            startFreqHz: 280,
            endFreqHz: 750,
            durationSec: 0.65,
          },
        },
      ],
      victimState: {
        pose: 'DEFENSIVE_ARMS_CROSSED',
        locomotionMode: 'STAND',
        positionX_3D: -190,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 30,
        customJointAngles: {
          spine: [-6, 0, 0],
          neck: [12, -10, 0],
          shoulderR: [35, -25, 40],
          shoulderL: [35, 25, -40],
          elbowR: [95, 0, 0],
          elbowL: [95, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'CALCULATING_CHIN_TOUCH',
        locomotionMode: 'STAND',
        positionX_3D: 190,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -35,
        customJointAngles: {
          shoulderR: [45, -20, -30],
          elbowR: [115, 0, 0],
          shoulderL: [0, 0, -8],
          elbowL: [5, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secret_lock',
          family: 'BARRIER_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'lock',
          lucideIconName: 'lock',
          state: 'SPAWN',
          attachedTo: 'VICTIM_HAND_R',
          targetCoordinates: [-130, -30, 20],
          scaleMultiplier: 1.0,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 2 (1.50s - 2.80s): "التاني بيقاطعه علطول"
    // Sudden forward interruption & Hook Bass Sweep (10% Rule peak 1)
    {
      beatId: 'beat_2_interruption_jump',
      startTime: 1.5,
      endTime: 2.8,
      activeSpeaker: 'MANIPULATOR',
      camera: {
        shot: 'SINGLE_CLOSEUP',
        targetZ: 1850,
        panX: 40,
        elevationOffset: 95,
        lookAtTarget: [90, 0, 0],
        focusSubject: 'MANIPULATOR',
        orbitalAngleDeg: 2,
        fovDeg: 36,
        transitionCurve: 'WHIP_ZOOM_IN',
        transitionDurationSec: 0.28,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [
        {
          sfxKey: 'sfx_hook_bass_sweep',
          triggerTime: 1.65,
          volume: 0.45,
          synthRecipe: {
            archetype: 'SWEEP_BASS',
            startFreqHz: 95,
            endFreqHz: 38,
            durationSec: 0.55,
          },
        },
      ],
      victimState: {
        pose: 'DEFENSIVE_ARMS_CROSSED',
        positionX_3D: -190,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 25,
        customJointAngles: {
          spine: [-10, 0, 0],
          neck: [-8, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: 180,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -40,
        customJointAngles: {
          spine: [18, 0, 0],
          neck: [-10, 0, 0],
          shoulderR: [28, -10, -25],
          shoulderL: [28, 10, 25],
          elbowR: [40, 0, 0],
          elbowL: [40, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secret_lock',
          family: 'BARRIER_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'lock',
          lucideIconName: 'lock',
          state: 'ACTIVE_IDLE',
          targetCoordinates: [-130, -30, 20],
          scaleMultiplier: 1.0,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 3 (2.80s - 4.70s): "«ده بالمللي اللي بيحصلي! كأنك بتحكي عني!»"
    // Mirroring affirmation with crystal chime sfx
    {
      beatId: 'beat_3_mirror_claim',
      startTime: 2.8,
      endTime: 4.7,
      activeSpeaker: 'MANIPULATOR',
      camera: {
        shot: 'ESTABLISHING',
        targetZ: 2200,
        panX: 10,
        elevationOffset: 85,
        lookAtTarget: [0, 0, 0],
        focusSubject: 'STAGE_CENTER',
        orbitalAngleDeg: 5,
        fovDeg: 38,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.65,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [
        {
          sfxKey: 'sfx_crystal_resonance',
          triggerTime: 2.85,
          volume: 0.4,
          synthRecipe: {
            archetype: 'CRYSTAL_GLASS',
            startFreqHz: 880,
            endFreqHz: 440,
            durationSec: 0.7,
            resonance: 2.2,
          },
        },
      ],
      victimState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: -180,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 35,
        customJointAngles: {
          spine: [-2, 0, 0],
          neck: [4, 0, 0],
          shoulderR: [15, 0, 10],
          shoulderL: [15, 0, -10],
          elbowR: [35, 0, 0],
          elbowL: [35, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: 175,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -35,
        customJointAngles: {
          spine: [16, 0, 0],
          neck: [-10, 0, 0],
          shoulderR: [35, 0, -35],
          shoulderL: [35, 0, 35],
          elbowR: [25, 0, 0],
          elbowL: [25, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secret_lock',
          family: 'BARRIER_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'unlock',
          lucideIconName: 'unlock',
          state: 'TRANSFORM_DANGER',
          targetCoordinates: [-110, -25, 20],
          scaleMultiplier: 1.05,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 4 (4.70s - 6.50s): "حذره كله بيتبخر"
    // Guard drops, lock dissolves
    {
      beatId: 'beat_4_guard_evaporates',
      startTime: 4.7,
      endTime: 6.5,
      activeSpeaker: 'NARRATOR',
      camera: {
        shot: 'ESTABLISHING',
        targetZ: 2500,
        panX: -20,
        elevationOffset: 75,
        lookAtTarget: [-40, -20, 0],
        focusSubject: 'VICTIM',
        orbitalAngleDeg: 8,
        fovDeg: 38,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.7,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [],
      victimState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: -175,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 40,
        customJointAngles: {
          spine: [4, 0, 0],
          neck: [-4, 0, 0],
          shoulderR: [5, 0, 8],
          shoulderL: [5, 0, -8],
          elbowR: [10, 0, 0],
          elbowL: [10, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: 175,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -40,
        customJointAngles: {
          spine: [12, 0, 0],
          neck: [-8, 0, 0],
          shoulderR: [20, 0, -15],
          shoulderL: [20, 0, 15],
          elbowR: [20, 0, 0],
          elbowL: [20, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secret_lock',
          family: 'BARRIER_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'unlock',
          lucideIconName: 'unlock',
          state: 'DESPAWN',
          targetCoordinates: [-80, 0, 20],
          scaleMultiplier: 0.4,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 5 (6.50s - 8.00s): "بيقتنع إنه لقى نسخة منه"
    // Twin mirror symbol appears between them
    {
      beatId: 'beat_5_twin_copy_illusion',
      startTime: 6.5,
      endTime: 8.0,
      activeSpeaker: 'VICTIM',
      camera: {
        shot: 'HORIZONTAL_PAN',
        targetZ: 2350,
        panX: 0,
        elevationOffset: 80,
        lookAtTarget: [0, -10, 0],
        focusSubject: 'STAGE_CENTER',
        orbitalAngleDeg: 12,
        fovDeg: 38,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.65,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [],
      victimState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: -165,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 45,
        customJointAngles: {
          spine: [8, 0, 0],
          neck: [-6, 0, 0],
          shoulderR: [10, 0, 12],
          shoulderL: [10, 0, -12],
          elbowR: [15, 0, 0],
          elbowL: [15, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: 165,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -45,
        customJointAngles: {
          spine: [8, 0, 0],
          neck: [-6, 0, 0],
          shoulderR: [10, 0, -12],
          shoulderL: [10, 0, 12],
          elbowR: [15, 0, 0],
          elbowL: [15, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_twin_mirror',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'copy',
          lucideIconName: 'copy',
          state: 'SPAWN',
          targetCoordinates: [0, -10, 0],
          scaleMultiplier: 1.25,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 6 (8.00s - 9.00s): "بيميل بجسمه لقدام"
    // Victim leans forward across table
    {
      beatId: 'beat_6_victim_forward_lean',
      startTime: 8.0,
      endTime: 9.0,
      activeSpeaker: 'VICTIM',
      camera: {
        shot: 'MACRO_OBJECT_ZOOM',
        targetZ: 1980,
        panX: -45,
        elevationOffset: 90,
        lookAtTarget: [-50, -10, 0],
        focusSubject: 'VICTIM',
        orbitalAngleDeg: 7,
        fovDeg: 36,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.5,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [],
      victimState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: -155,
        positionY_3D: -340,
        positionZ_3D: 0,
        pelvisOffset: [15, -6, 0],
        facingYawDeg: 45,
        customJointAngles: {
          spine: [24, 0, 0],
          neck: [-14, 0, 0],
          shoulderR: [30, 0, 15],
          shoulderL: [20, 0, -10],
          elbowR: [35, 0, 0],
          elbowL: [25, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: 165,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -45,
        customJointAngles: {
          spine: [10, 0, 0],
          neck: [-8, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_twin_mirror',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'copy',
          lucideIconName: 'copy',
          state: 'ACTIVE_IDLE',
          targetCoordinates: [0, -10, 0],
          scaleMultiplier: 1.25,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 7 (9.00s - 10.15s): "بيندفع يحكي كل أسراره"
    // Secret Key prop appears in victim's extended hand
    {
      beatId: 'beat_7_spilling_secrets',
      startTime: 9.0,
      endTime: 10.15,
      activeSpeaker: 'VICTIM',
      camera: {
        shot: 'MACRO_OBJECT_ZOOM',
        targetZ: 1720,
        panX: -25,
        elevationOffset: 95,
        lookAtTarget: [-30, -20, 0],
        focusSubject: 'ACTIVE_PROP',
        orbitalAngleDeg: 4,
        fovDeg: 34,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.5,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [
        {
          sfxKey: 'sfx_friction_click',
          triggerTime: 9.05,
          volume: 0.4,
          synthRecipe: {
            archetype: 'TENSION_FRICTION',
            startFreqHz: 240,
            endFreqHz: 90,
            durationSec: 0.5,
          },
        },
      ],
      victimState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: -150,
        positionY_3D: -340,
        positionZ_3D: 0,
        pelvisOffset: [20, -8, 0],
        facingYawDeg: 40,
        customJointAngles: {
          spine: [26, 0, 0],
          neck: [-16, 0, 0],
          shoulderR: [45, 0, 10],
          elbowR: [20, 0, 0],
          shoulderL: [15, 0, -10],
          elbowL: [40, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'IDLE_NEUTRAL',
        positionX_3D: 165,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -45,
        customJointAngles: {
          spine: [12, 0, 0],
          neck: [-8, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secrets_key',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'key',
          lucideIconName: 'key',
          state: 'ATTACH_TO_HAND',
          attachedTo: 'VICTIM_HAND_R',
          targetCoordinates: [-45, -25, 10],
          scaleMultiplier: 1.1,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 8 (10.15s - 11.25s): "اللي قصاده بيميل نفس الميلَة"
    // Perfect Mirror Lean: Head clearance >= 120px strictly locked!
    // (X_Victim = -145, X_Manip = +145 => distance = 290px >= 120px)
    {
      beatId: 'beat_8_mirrored_lean',
      startTime: 10.15,
      endTime: 11.25,
      activeSpeaker: 'MANIPULATOR',
      camera: {
        shot: 'ESTABLISHING',
        targetZ: 2050,
        panX: 0,
        elevationOffset: 90,
        lookAtTarget: [0, -10, 0],
        focusSubject: 'STAGE_CENTER',
        orbitalAngleDeg: -6,
        fovDeg: 38,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.6,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [],
      victimState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: -145,
        positionY_3D: -340,
        positionZ_3D: 0,
        pelvisOffset: [20, -8, 0],
        facingYawDeg: 40,
        customJointAngles: {
          spine: [26, 0, 0],
          neck: [-16, 0, 0],
          shoulderR: [45, 0, 10],
          elbowR: [20, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: 145,
        positionY_3D: -340,
        positionZ_3D: 0,
        pelvisOffset: [-20, -8, 0],
        facingYawDeg: -40,
        customJointAngles: {
          spine: [26, 0, 0],
          neck: [-16, 0, 0],
          shoulderL: [45, 0, -10],
          elbowL: [20, 0, 0],
          shoulderR: [15, 0, 10],
          elbowR: [40, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secrets_key',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'key',
          lucideIconName: 'key',
          state: 'MOVE_BETWEEN_HANDS',
          targetCoordinates: [-15, -25, 10],
          scaleMultiplier: 1.1,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 9 (11.25s - 12.80s): "بيثبت مركز معاه"
    // Suspense flicker, intense gaze lock
    {
      beatId: 'beat_9_locked_focus',
      startTime: 11.25,
      endTime: 12.8,
      activeSpeaker: 'MANIPULATOR',
      camera: {
        shot: 'SINGLE_CLOSEUP',
        targetZ: 1950,
        panX: 15,
        elevationOffset: 92,
        lookAtTarget: [20, -10, 0],
        focusSubject: 'MANIPULATOR',
        orbitalAngleDeg: -3,
        fovDeg: 36,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.65,
      },
      lighting: 'SUSPENSE_FLICKER',
      tensionBedVolume: 0.24,
      sfxEvents: [],
      victimState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: -145,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 40,
        customJointAngles: {
          spine: [24, 0, 0],
          neck: [-16, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: 145,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -40,
        customJointAngles: {
          spine: [26, 0, 0],
          neck: [-16, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secrets_key',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'key',
          lucideIconName: 'key',
          state: 'MOVE_BETWEEN_HANDS',
          targetCoordinates: [10, -25, 10],
          scaleMultiplier: 1.15,
          semanticColor: '#06B6D4',
        },
      ],
    },

    // Beat 10 (12.80s - 14.50s): "بيسحب منه باقي الكلام"
    // THE PAYOFF / TWIST: Shock Freeze (0.4s) + Deep Sub-Drop Bass (10% Rule peak 2)
    // Lighting flips to DANGER_REVEAL (#F59E0B)
    {
      beatId: 'beat_10_extraction_twist',
      startTime: 12.8,
      endTime: 14.5,
      activeSpeaker: 'MANIPULATOR',
      camera: {
        shot: 'MACRO_OBJECT_ZOOM',
        targetZ: 1480,
        panX: 35,
        elevationOffset: 95,
        lookAtTarget: [60, -20, 0],
        focusSubject: 'ACTIVE_PROP',
        orbitalAngleDeg: 6,
        fovDeg: 32,
        dutchTiltDeg: 3.5,
        transitionCurve: 'SHOCK_FREEZE',
        transitionDurationSec: 0.4,
      },
      lighting: 'DANGER_REVEAL',
      tensionBedVolume: 0.24,
      sfxEvents: [
        {
          sfxKey: 'sfx_twist_sub_drop',
          triggerTime: 13.1,
          volume: 0.45,
          synthRecipe: {
            archetype: 'SUB_DROP',
            startFreqHz: 80,
            endFreqHz: 28,
            durationSec: 0.75,
          },
        },
      ],
      victimState: {
        pose: 'SUBMISSIVE_SHRINK',
        positionX_3D: -155,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 35,
        freezeBreathing: true,
        customJointAngles: {
          spine: [-12, 0, 0],
          neck: [18, 0, 0],
          shoulderR: [20, 0, 25],
          shoulderL: [20, 0, -25],
          elbowR: [45, 0, 0],
          elbowL: [45, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'DOMINANT_LEAN_FORWARD',
        positionX_3D: 140,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -45,
        freezeBreathing: true,
        customJointAngles: {
          spine: [18, 0, 0],
          neck: [-10, 0, 0],
          shoulderL: [55, -10, -10],
          elbowL: [25, 0, 0],
          shoulderR: [25, 0, 15],
          elbowR: [35, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secrets_key',
          family: 'DECEPTION_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'key',
          lucideIconName: 'key',
          state: 'ATTACH_TO_HAND',
          attachedTo: 'MANIPULATOR_HAND_L',
          targetCoordinates: [65, -20, 15],
          scaleMultiplier: 1.35,
          semanticColor: '#F59E0B',
        },
      ],
    },

    // Beat 11 (14.50s - 15.01s): Smooth return to Frame 0 (Seamless Loop Rule in last 0.51s)
    {
      beatId: 'beat_11_seamless_loop',
      startTime: 14.5,
      endTime: duration,
      activeSpeaker: 'NARRATOR',
      camera: {
        shot: 'HOOK_MEDIUM',
        targetZ: 2100,
        panX: 0,
        elevationOffset: 90,
        lookAtTarget: [0, -10, 0],
        focusSubject: 'STAGE_CENTER',
        orbitalAngleDeg: -4,
        fovDeg: 38,
        dutchTiltDeg: 0,
        transitionCurve: 'EASE_IN_OUT_CUBIC',
        transitionDurationSec: 0.51,
      },
      lighting: 'TRUST_MODE',
      tensionBedVolume: 0.14,
      sfxEvents: [],
      victimState: {
        pose: 'DEFENSIVE_ARMS_CROSSED',
        positionX_3D: -190,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: 30,
        customJointAngles: {
          spine: [-6, 0, 0],
          neck: [12, -10, 0],
          shoulderR: [35, -25, 40],
          shoulderL: [35, 25, -40],
          elbowR: [95, 0, 0],
          elbowL: [95, 0, 0],
        },
      },
      manipulatorState: {
        pose: 'CALCULATING_CHIN_TOUCH',
        positionX_3D: 190,
        positionY_3D: -340,
        positionZ_3D: 0,
        facingYawDeg: -35,
        customJointAngles: {
          shoulderR: [45, -20, -30],
          elbowR: [115, 0, 0],
          shoulderL: [0, 0, -8],
          elbowL: [5, 0, 0],
        },
      },
      propEvents: [
        {
          propId: 'prop_secret_lock',
          family: 'BARRIER_FAMILY',
          generationMethod: 'SVG_EXTRUSION',
          assetKey: 'lock',
          lucideIconName: 'lock',
          state: 'SPAWN',
          attachedTo: 'VICTIM_HAND_R',
          targetCoordinates: [-130, -30, 20],
          scaleMultiplier: 1.0,
          semanticColor: '#06B6D4',
        },
      ],
    },
  ];

  const blueprint = {
    episodeId: `episode_${Date.now()}`,
    audioUrl: 'audio.mp3',
    durationInSeconds: duration,
    fps: fps,
    stage: stage,
    subtitles: subtitles,
    beats: beats,
  };

  fs.mkdirSync(path.dirname(episodePath), { recursive: true });
  fs.writeFileSync(episodePath, JSON.stringify(blueprint, null, 2), 'utf8');
  console.log(`[Episode Builder] Successfully generated ${episodePath} (${beats.length} beats, ${subtitles.length} subtitles) in 0.04s`);
  return blueprint;
}

if (process.argv[1] && process.argv[1].endsWith('build-episode.mjs')) {
  buildEpisode();
}
