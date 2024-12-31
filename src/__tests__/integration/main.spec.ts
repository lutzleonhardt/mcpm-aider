import { execa } from 'execa';
import { resolve } from 'path';

const bin = resolve(__dirname, './bin.js');

describe('my-command', () => {
  it('should display the help contents', async () => {
    const { stdout } = await execa(bin, ['--help'], {
      env: { TS_NODE_FILES: 'true' },
    });

    expect(stdout).toContain('Usage: my-command [options]');
  });
});
