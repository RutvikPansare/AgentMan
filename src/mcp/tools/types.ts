
import { CollectionManager } from '../../engine/collection-manager.js';
import { EnvironmentManager } from '../../engine/environment-manager.js';
import { AuthManager } from '../../engine/auth-manager.js';
import { HttpResponse } from '../../types/index.js';

export interface EngineContext {
  collectionManager: CollectionManager;
  environmentManager: EnvironmentManager;
  authManager: AuthManager;
  lastResponseCache: Map<string, HttpResponse>;
  executeRequest: (config: any, env?: any, auth?: any) => Promise<HttpResponse>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
}

export interface ToolHandlerResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}
