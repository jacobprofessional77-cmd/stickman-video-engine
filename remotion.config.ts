import { Config } from '@remotion/cli/config';

// Dynamic OpenGL renderer: defaults to swangle for headless CPU runners (GitHub Actions),
// or accepts hardware acceleration (angle/egl) when running on GPU environments (Google Colab / local GPU)
const glRenderer = (process.env.REMOTION_GL as any) || 'swangle';
Config.setChromiumOpenGlRenderer(glRenderer);
Config.setPixelFormat('yuv420p');
Config.setCrf(16);

