#!/usr/bin/env node
import * as path from 'path';
import * as os from 'os';
import { CollectionManager } from '../engine/collection-manager.js';
import { EnvironmentManager } from '../engine/environment-manager.js';
import { AuthManager } from '../engine/auth-manager.js';
import { ProxyServer } from '../engine/proxy.js';
import { ResponseStore } from '../engine/response-store.js';
import { execute as executeRequest } from '../engine/http-executor.js';
import { startServer } from '../mcp/server.js';
import { EngineContext } from '../mcp/tools/types.js';

import { startExpressServer } from './express.js';

async function main() {
  const reqlyDir = path.join(os.homedir(), '.reqly');
  const collectionsDir = path.join(reqlyDir, 'collections');
  const environmentsPath = path.join(reqlyDir, 'environments.yaml');
  
  const globalConfigPath = path.join(reqlyDir, 'config.json');

  const collectionManager = new CollectionManager(collectionsDir);
  const environmentManager = new EnvironmentManager(environmentsPath);
  const authManager = new AuthManager(globalConfigPath);
  const proxyServer = new ProxyServer(collectionManager);
  const responseStore = new ResponseStore();

  const context: EngineContext = {
    collectionManager,
    environmentManager,
    authManager,
    proxyServer,
    responseStore,
    executeRequest
  };

  startExpressServer(context);
  await startServer(context);
}

main().catch(err => {
  console.error('Fatal error starting Reqly MCP server:', err);
  process.exit(1);
});
