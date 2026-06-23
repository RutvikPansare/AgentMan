import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'run_request',
  description: 'Fire a saved request by name.',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: { type: 'string' },
      requestName: { type: 'string' }
    },
    required: ['collectionName', 'requestName']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    const req = await context.collectionManager.getRequest(args.collectionName, args.requestName);
    const env = await context.environmentManager.getActiveEnvironment();
    
    let auth;
    if (req.authProfileId) {
      auth = await context.authManager.getProfile(req.authProfileId);
    }

    const res = await context.executeRequest(req, env || undefined, auth);
    
    // Store in cache
    context.lastResponseCache.set(req.name, res);

    return { content: [{ type: 'text', text: JSON.stringify(res) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
