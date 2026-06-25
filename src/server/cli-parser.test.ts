import { describe, it, expect } from 'vitest';
import { parseArgs, resolveProjectDir } from './cli-parser.js';

describe('cli-parser', () => {
  it('defaults to start command when no command is provided', () => {
    const parsed = parseArgs(['node', 'script.js']);
    expect(parsed.command).toBe('start');
    expect(parsed.args).toEqual([]);
    expect(parsed.flags).toEqual({});
  });

  it('parses start command', () => {
    const parsed = parseArgs(['node', 'script.js', 'start']);
    expect(parsed.command).toBe('start');
    expect(parsed.args).toEqual([]);
  });

  it('parses run command with arguments', () => {
    const parsed = parseArgs(['node', 'script.js', 'run', 'collectionName', 'requestName']);
    expect(parsed.command).toBe('run');
    expect(parsed.args).toEqual(['collectionName', 'requestName']);
  });

  it('parses use command with a path argument', () => {
    const parsed = parseArgs(['node', 'script.js', 'use', '/Users/dev/my-project']);
    expect(parsed.command).toBe('use');
    expect(parsed.args).toEqual(['/Users/dev/my-project']);
  });

  it('parses status command', () => {
    const parsed = parseArgs(['node', 'script.js', 'status']);
    expect(parsed.command).toBe('status');
    expect(parsed.args).toEqual([]);
  });

  it('parses flags before and after command', () => {
    const parsed = parseArgs(['node', 'script.js', '--env', 'production', 'run', 'myCol', '--reporter', 'json', '--project-dir', '/tmp']);
    expect(parsed.command).toBe('run');
    expect(parsed.args).toEqual(['myCol']);
    expect(parsed.flags).toEqual({
      env: 'production',
      reporter: 'json',
      projectDir: '/tmp'
    });
  });
});

describe('resolveProjectDir', () => {
  it('falls back to cwd when neither flag nor env var is set', () => {
    expect(resolveProjectDir({ cwd: '/home/user/project' })).toBe('/home/user/project');
  });

  it('uses REQLY_PROJECT_DIR env var when no flag is given', () => {
    expect(resolveProjectDir({ env: '/home/user/project', cwd: '/' })).toBe('/home/user/project');
  });

  it('prefers --project-dir flag over the env var', () => {
    expect(resolveProjectDir({ flag: '/flag/dir', env: '/env/dir', cwd: '/' })).toBe('/flag/dir');
  });

  it('resolves a relative flag against cwd', () => {
    expect(resolveProjectDir({ flag: '../sibling', cwd: '/home/user/project' })).toBe('/home/user/sibling');
  });

  it('uses configActiveProject when no flag or env var is set', () => {
    expect(resolveProjectDir({ configActiveProject: '/home/user/tellero', cwd: '/' })).toBe('/home/user/tellero');
  });

  it('prefers env var over configActiveProject', () => {
    expect(resolveProjectDir({ env: '/env/dir', configActiveProject: '/config/dir', cwd: '/' })).toBe('/env/dir');
  });

  it('prefers flag over configActiveProject', () => {
    expect(resolveProjectDir({ flag: '/flag/dir', configActiveProject: '/config/dir', cwd: '/' })).toBe('/flag/dir');
  });
});
