import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AuthManager, AuthProfileNotFoundError } from './auth-manager.js';
import { AuthType } from '../types/index.js';

describe('AuthManager', () => {
  let tmpFile: string;
  let manager: AuthManager;

  beforeEach(() => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'reqly-auth-test-'));
    tmpFile = path.join(tmpDir, 'config.json');
    manager = new AuthManager(tmpFile);
  });

  afterEach(() => {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  });

  it('should create and get an auth profile', async () => {
    const profile = await manager.createProfile({
      name: 'Test Profile',
      type: AuthType.BEARER,
      credentials: { token: 'secret' },
    });
    
    expect(profile.id).toBeDefined();
    expect(profile.name).toBe('Test Profile');

    const retrieved = await manager.getProfile(profile.id);
    expect(retrieved.name).toBe('Test Profile');
    expect(retrieved.credentials).toEqual({ token: 'secret' });
  });

  it('should throw error without exposing credentials when profile not found', async () => {
    await expect(manager.getProfile('missing-id')).rejects.toThrow(AuthProfileNotFoundError);
    await expect(manager.getProfile('missing-id')).rejects.toThrow('Auth profile missing-id not found');
  });

  it('should list auth profiles', async () => {
    await manager.createProfile({ name: 'A', type: AuthType.BEARER, credentials: {} });
    await manager.createProfile({ name: 'B', type: AuthType.API_KEY, credentials: {} });

    const profiles = await manager.listProfiles();
    expect(profiles).toHaveLength(2);
    expect(profiles.map(p => p.name).sort()).toEqual(['A', 'B']);
  });

  it('should delete an auth profile', async () => {
    const profile = await manager.createProfile({
      name: 'Test Profile',
      type: AuthType.BEARER,
      credentials: { token: 'secret' },
    });

    await manager.deleteProfile(profile.id);

    await expect(manager.getProfile(profile.id)).rejects.toThrow(AuthProfileNotFoundError);
    const profiles = await manager.listProfiles();
    expect(profiles).toHaveLength(0);
  });

  it('should throw error when deleting non-existent profile', async () => {
    await expect(manager.deleteProfile('missing-id')).rejects.toThrow(AuthProfileNotFoundError);
  });
});
