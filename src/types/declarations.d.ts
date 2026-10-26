declare module 'remotion' {
  export const useCurrentFrame: () => number;
  export const useVideoConfig: () => { fps: number; width: number; height: number; durationInFrames: number };
  export const interpolate: (input: number, inputRange: number[], outputRange: number[], options?: any) => number;
  export const staticFile: (path: string) => string;
  export const AbsoluteFill: any;
  export const Audio: any;
  export const Composition: any;
  export const registerRoot: (comp: any) => void;
}

declare module '@remotion/google-fonts/Cairo' {
  export function loadFont(style?: string, options?: any): { fontFamily: string };
}

declare module '@react-three/fiber' {
  export const Canvas: any;
  export const useFrame: any;
  export const useThree: any;
}

declare module '@react-three/drei' {
  export const ContactShadows: any;
  export const MeshReflectorMaterial: any;
}

declare module '@react-three/postprocessing' {
  export const EffectComposer: any;
  export const Bloom: any;
}

declare module 'three' {
  const all: any;
  export = all;
}

declare module 'three-stdlib' {
  const all: any;
  export = all;
}

declare module 'three/examples/jsm/loaders/SVGLoader.js' {
  export const SVGLoader: any;
}

// Global JSX elements for React Three Fiber
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
