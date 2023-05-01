import { defineConfig } from 'tsup';

export default defineConfig({
  loader: {
    '.hbs': 'copy',
  },
});
