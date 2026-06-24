import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { EngineContext } from './tools/types.js';

import * as runRequest from './tools/run-request.js';
import * as createRequest from './tools/create-request.js';
import * as createCollection from './tools/create-collection.js';
import * as listCollections from './tools/list-collections.js';
import * as setEnvironment from './tools/set-environment.js';
import * as runCollection from './tools/run-collection.js';
import * as getResponse from './tools/get-response.js';

import * as startProxy from './tools/start-proxy.js';
import * as stopProxy from './tools/stop-proxy.js';

import * as createEnvironment from './tools/create-environment.js';
import * as setVariable from './tools/set-variable.js';
import * as getVariables from './tools/get-variables.js';
import * as deleteVariable from './tools/delete-variable.js';

import * as getResponseFull from './tools/get-response-full.js';

const tools = [
  runRequest,
  createRequest,
  createCollection,
  listCollections,
  setEnvironment,
  runCollection,
  getResponse,
  startProxy,
  stopProxy,
  createEnvironment,
  setVariable,
  getVariables,
  deleteVariable,
  getResponseFull
];

import { z } from 'zod';

function convertSchemaToZodShape(schema: any) {
  if (!schema || !schema.properties) return {};
  const shape: any = {};
  for (const [k, v] of Object.entries(schema.properties)) {
    let zType: any = z.any();
    if ((v as any).type === 'string') zType = z.string();
    else if ((v as any).type === 'number') zType = z.number();
    else if ((v as any).type === 'boolean') zType = z.boolean();
    
    if (schema.required && !schema.required.includes(k)) {
      zType = zType.optional();
    }
    shape[k] = zType;
  }
  return shape;
}

export function createServer(context: EngineContext) {
  const server = new McpServer({
    name: 'Reqly',
    version: '1.0.0'
  });

  for (const t of tools) {
    const shape = convertSchemaToZodShape(t.definition.inputSchema);
    server.tool(t.definition.name, t.definition.description, shape, async (args: any) => {
      return await t.handler(args, context);
    });
  }

  return server;
}

export async function startServer(context: EngineContext) {
  const server = createServer(context);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
