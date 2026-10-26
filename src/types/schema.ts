export type LightingMode =
  | 'TRUST_MODE'
  | 'COLD_NEUTRAL'
  | 'SUSPENSE_FLICKER'
  | 'DANGER_REVEAL'
  | 'CLARITY_ASCENSION'
  | 'ROYAL_PRESTIGE'
  | string;

export interface AtmospherePalette {
  topSkyHex: string;
  horizonHex: string;
  floorHex: string;
}

export interface PrimitivePart {
  shape: 'BOX_BEVELED' | 'CYLINDER' | 'SPHERE' | 'RING_TORUS' | 'CONE' | 'TUBE_SPLINE';
  offset: [number, number, number];
  rotationDeg?: [number, number, number];
  size: [number, number, number];
  splinePoints?: Array<[number, number, number]>;
}

export interface StageElement {
  id: string;
  elementType: string;
  geometryRecipe:
    | 'BOX_BEVELED'
    | 'CYLINDER_HOLLOW'
    | 'SLOPE_RAMP'
    | 'PIT_CUTOUT'
    | 'STAIRCASE'
    | 'BRIDGE_CHASM'
    | 'COMPOUND_PRIMITIVES'
    | 'SVG_EXTRUDED';
  position: [number, number, number];
  dimensions: [number, number, number];
  rotationDeg?: [number, number, number];
  color?: string;
  emissiveGlow?: boolean;
  lucideIconName?: string;
  svgPathData?: string;
  compoundParts?: PrimitivePart[];
}

export interface StageConfig {
  mode: 'DUEL_REFLECTIVE' | 'ARCHITECTURAL_CROSS_SECTION' | string;
  atmospherePalette?: AtmospherePalette;
  showAmbientMoon: boolean;
  floorReflectivity: number;
  elements: StageElement[];
  bystanderCrowdCount: number;
  bystanderPositions?: Array<[number, number, number]>;
}

export interface SubtitleChunk {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface SoundSynthesisRecipe {
  archetype:
    | 'SWEEP_BASS'
    | 'SUB_DROP'
    | 'AIR_WHOOSH'
    | 'CRYSTAL_GLASS'
    | 'METAL_RING'
    | 'TENSION_FRICTION'
    | 'WOOD_STONE_IMPACT';
  startFreqHz: number;
  endFreqHz: number;
  durationSec: number;
  resonance?: number;
}

export interface SoundEffectEvent {
  sfxKey: string;
  triggerTime: number;
  volume: number;
  synthRecipe: SoundSynthesisRecipe;
}

export interface SymbolicPropEvent {
  propId: string;
  family: 'BARRIER_FAMILY' | 'CONTROL_FAMILY' | 'STATUS_FAMILY' | 'DECEPTION_FAMILY';
  generationMethod: 'PROCEDURAL_3D' | 'SVG_EXTRUSION' | 'COMPOUND_3D';
  assetKey: string;
  lucideIconName?: string;
  svgPathData?: string;
  compoundParts?: PrimitivePart[];
  state:
    | 'SPAWN'
    | 'ACTIVE_IDLE'
    | 'ATTACH_TO_HAND'
    | 'MOVE_BETWEEN_HANDS'
    | 'TRANSFORM_DANGER'
    | 'SHATTER'
    | 'DESPAWN';
  attachedTo?:
    | 'VICTIM_HAND_R'
    | 'VICTIM_HAND_L'
    | 'MANIPULATOR_HAND_R'
    | 'MANIPULATOR_HAND_L'
    | 'STAGE_CENTER';
  targetCoordinates?: [number, number, number];
  scaleMultiplier?: number;
  semanticColor: string;
}

export interface CharacterKeyframe {
  pose: string;
  locomotionMode?:
    | 'STAND'
    | 'WALK'
    | 'CLIMB_STAIRS'
    | 'STUMBLE_BACK'
    | 'SIT'
    | 'KNEEL'
    | 'PULL_HEAVY';
  positionX_3D: number;
  positionY_3D: number;
  positionZ_3D?: number;
  pelvisOffset?: [number, number, number];
  facingDirection?:
    | 'RIGHT'
    | 'LEFT'
    | 'FRONT'
    | 'BACK'
    | 'THREE_QUARTER_L'
    | 'THREE_QUARTER_R'
    | string;
  facingYawDeg?: number;
  customJointAngles?: Partial<
    Record<
      | 'spine'
      | 'neck'
      | 'shoulderL'
      | 'shoulderR'
      | 'elbowL'
      | 'elbowR'
      | 'hipL'
      | 'hipR'
      | 'kneeL'
      | 'kneeR',
      [number, number, number]
    >
  >;
  ikTargets?: {
    handLeft?: [number, number, number];
    handRight?: [number, number, number];
    footLeft?: [number, number, number];
    footRight?: [number, number, number];
  };
  freezeBreathing?: boolean;
}

export interface SceneBeat {
  beatId: string;
  startTime: number;
  endTime: number;
  activeSpeaker: 'VICTIM' | 'MANIPULATOR' | 'NARRATOR';
  camera: {
    shot:
      | 'HOOK_MEDIUM'
      | 'ESTABLISHING'
      | 'EPIC_WIDE'
      | 'MACRO_OBJECT_ZOOM'
      | 'SINGLE_CLOSEUP'
      | 'VERTICAL_TRACK'
      | 'HORIZONTAL_PAN'
      | string;
    targetZ: number;
    panX?: number;
    elevationOffset: number;
    lookAtTarget?: [number, number, number];
    focusSubject?: 'STAGE_CENTER' | 'VICTIM' | 'MANIPULATOR' | 'ACTIVE_PROP' | 'CUSTOM_COORDS';
    orbitalAngleDeg: number;
    fovDeg?: number;
    dutchTiltDeg?: number;
    transitionCurve:
      | 'EASE_IN_OUT_CUBIC'
      | 'WHIP_ZOOM_IN'
      | 'WHIP_ZOOM_OUT'
      | 'LINEAR_TRACK'
      | 'SHOCK_FREEZE';
    transitionDurationSec?: number;
  };
  lighting: LightingMode;
  tensionBedVolume: 0.14 | 0.24;
  sfxEvents: SoundEffectEvent[];
  victimState: CharacterKeyframe;
  manipulatorState: CharacterKeyframe;
  propEvents: SymbolicPropEvent[];
}

export interface EpisodeBlueprint {
  episodeId: string;
  audioUrl: string;
  durationInSeconds: number;
  fps: 30;
  stage: StageConfig;
  subtitles: SubtitleChunk[];
  beats: SceneBeat[];
}
