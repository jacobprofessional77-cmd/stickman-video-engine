import { Config } from '@remotion/cli/config';

// Use swangle by default for guaranteed WebGL context on headless Linux/Colab
const glRenderer = (process.env.REMOTION_GL as any) || 'swangle';
Config.setChromiumOpenGlRenderer(glRenderer);

// Essential Chrome flags for Headless Linux / Docker / Colab to prevent context loss and crashes
Config.setChromiumOptions({
  ignoreGpuBlocklist: true,
  noSandbox: true,
  disableDevShmUsage: true,
});

Config.setPixelFormat('yuv420p');
Config.setCrf(16);
