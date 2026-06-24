import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { AuthProfile } from '../types/index.js';

export class AuthProfileNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthProfileNotFoundError';
  }
}

interface ConfigFile {
  authProfiles?: AuthProfile[];
  [key: string]: any;
}

export class AuthManager {
  constructor(private configPath: string) {}

  public async loadConfig(): Promise<ConfigFile> {
    if (!existsSync(this.configPath)) {
      return {};
    }
    const content = await fs.readFile(this.configPath, 'utf8');
    try {
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private async saveConfig(config: ConfigFile): Promise<void> {
    const dir = path.dirname(this.configPath);
    if (!existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
    const content = JSON.stringify(config, null, 2);
    await fs.writeFile(this.configPath, content, 'utf8');
  }

  async createProfile(profile: Omit<AuthProfile, 'id'>): Promise<AuthProfile> {
    const config = await this.loadConfig();
    const profiles = config.authProfiles || [];

    const newProfile: AuthProfile = {
      ...profile,
      id: `auth-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    profiles.push(newProfile);
    config.authProfiles = profiles;
    await this.saveConfig(config);

    return newProfile;
  }

  async getProfile(id: string): Promise<AuthProfile> {
    const config = await this.loadConfig();
    const profiles = config.authProfiles || [];
    const profile = profiles.find(p => p.id === id);
    if (!profile) {
      throw new AuthProfileNotFoundError(`Auth profile ${id} not found`);
    }
    return profile;
  }

  async listProfiles(): Promise<AuthProfile[]> {
    const config = await this.loadConfig();
    return config.authProfiles || [];
  }

  async deleteProfile(id: string): Promise<void> {
    const config = await this.loadConfig();
    const profiles = config.authProfiles || [];
    
    const index = profiles.findIndex(p => p.id === id);
    if (index === -1) {
      throw new AuthProfileNotFoundError(`Auth profile ${id} not found`);
    }

    profiles.splice(index, 1);
    config.authProfiles = profiles;
    await this.saveConfig(config);
  }
}
