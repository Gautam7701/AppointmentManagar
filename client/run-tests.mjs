import react from '@vitejs/plugin-react';
import { startVitest } from 'vitest/node';

const runner = await startVitest('test', process.argv.slice(2), {
  config: false,
  root: process.cwd(),
  run: true,
  testNamePattern: process.env.TEST_NAME
}, {
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/testSetup.js'], testTimeout: 15000 }
});
await runner?.close();
