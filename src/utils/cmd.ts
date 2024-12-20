import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ClaudeCommands {
  getClaudePath(): Promise<string>;
  killClaude(): Promise<void>;
  startClaude(claudePath: string): Promise<void>;
}

class WindowsClaudeCommands implements ClaudeCommands {
  async getClaudePath(): Promise<string> {
    try {
      const { stdout } = await execAsync(
        'powershell -Command "Get-Process Claude -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"'
      );
      let claudePath = stdout.toString().trim();

      if (!claudePath) {
        // If Claude is not running, try to find it in Program Files
        const defaultPaths = [
          'C:\\Program Files\\Claude\\Claude.exe',
          'C:\\Program Files (x86)\\Claude\\Claude.exe',
          `${process.env.PROGRAMDATA}\\Programs\\Claude\\Claude.exe`,
        ];

        // Check if any of these paths exist
        for (const path of defaultPaths) {
          try {
            await execAsync(`if exist "${path}" (exit 0) else (exit 1)`);
            claudePath = path;
            break;
          } catch {
            continue;
          }
        }
      }

      if (!claudePath) {
        throw new Error('Claude executable not found');
      }

      return claudePath;
    } catch (error) {
      throw new Error(`Failed to get Claude path: ${(error as Error).message}`);
    }
  }

  async killClaude(): Promise<void> {
    try {
      await execAsync('taskkill /F /IM Claude.exe');
    } catch (error: any) {
      // Error code 128 means process not found, which is fine
      if (error.code !== 128) {
        throw new Error(`Failed to kill Claude: ${error.message}`);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async startClaude(claudePath: string): Promise<void> {
    try {
      exec(`"${claudePath}"`);
      // We don't wait for the process to finish, just return once it's started
    } catch (error) {
      throw new Error(`Failed to start Claude: ${(error as Error).message}`);
    }
  }
}

class MacClaudeCommands implements ClaudeCommands {
  async getClaudePath(): Promise<string> {
    try {
      const { stdout } = await execAsync(
        'ps aux | grep -v grep | grep "/Applications/Claude.app/Contents/MacOS/Claude"'
      );
      const claudePath = '/Applications/Claude.app/Contents/MacOS/Claude';

      if (!stdout.includes(claudePath)) {
        throw new Error('Claude executable not found');
      }

      return claudePath;
    } catch (error) {
      throw new Error(`Failed to get Claude path: ${(error as Error).message}`);
    }
  }

  async killClaude(): Promise<void> {
    try {
      await execAsync('pkill -9 Claude');
    } catch (error: any) {
      // Error code 1 means process not found, which is fine
      if (error.code !== 1) {
        throw new Error(`Failed to kill Claude: ${error.message}`);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async startClaude(): Promise<void> {
    try {
      exec('open -a Claude');
      // We don't wait for the process to finish, just return once it's started
    } catch (error) {
      throw new Error(`Failed to start Claude: ${(error as Error).message}`);
    }
  }
}

export async function restartClaude(): Promise<void> {
  const commands: ClaudeCommands =
    process.platform === 'win32'
      ? new WindowsClaudeCommands()
      : new MacClaudeCommands();

  try {
    const claudePath = await commands.getClaudePath();
    await commands.killClaude();
    // Wait for 2 seconds before starting Claude
    await new Promise(resolve => setTimeout(resolve, 2000));
    await commands.startClaude(claudePath);
  } catch (error) {
    throw new Error(`Failed to restart Claude: ${(error as Error).message}`);
  }
}

export async function installUvOnMacOrLinux(): Promise<void> {
  // https://docs.astral.sh/uv/configuration/installer/
  // curl -LsSf https://astral.sh/uv/install.sh | env UV_INSTALL_DIR="/custom/path" sh
  await execAsync(
    // 'curl -LsSf https://astral.sh/uv/install.sh | env UV_UNMANAGED_INSTALL="~/.mcpm/uv/.local/bin" sh'
    'curl -LsSf https://astral.sh/uv/install.sh | sh'
  );
}

export async function installUvOnWin(): Promise<void> {
  // Need change the execution policy to Bypass
  // https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-7.4#powershell-execution-policies
  await execAsync(
    'powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"'
  );
}
