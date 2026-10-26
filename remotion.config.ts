import { Config } from '@remotion/cli/config';

// Use swangle (Software ANGLE) for 100% reliable headless WebGL rendering on GitHub Actions Linux runners
Config.setChromiumOpenGlRenderer('swangle');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
