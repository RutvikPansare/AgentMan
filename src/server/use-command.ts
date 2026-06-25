import * as path from 'path';
import { AuthManager } from '../engine/auth-manager.js';
import { ParsedArgs } from './cli-parser.js';

export async function handleUseCommand(parsed: ParsedArgs, authManager: AuthManager): Promise<number> {
  const [target] = parsed.args;

  if (!target) {
    console.error('Error: Project path is required for "reqly use" (e.g. "reqly use ." or "reqly use /path/to/project")');
    return 1;
  }

  const resolved = path.resolve(process.cwd(), target);
  await authManager.setActiveProject(resolved);

  console.log(`Active project set to ${resolved}`);
  console.log('Restart your AI tool (Claude Desktop / Cursor) to pick up the change.');
  return 0;
}
