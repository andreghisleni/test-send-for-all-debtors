import { defineConfig } from 'tsup';

export default defineConfig({
  loader: {
    '.hbs': 'copy',
    '.png': 'copy',
  },
  bundle: false,
  // sourcemap: true,
  dts: true,
  clean: true,
  platform: "node",
  target: "node16",
});
