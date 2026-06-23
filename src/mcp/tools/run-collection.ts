import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'run_collection',
  description: 'Fire all requests in a collection sequentially.',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: { type: 'string' }
    },
    required: ['collectionName']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    const col = await context.collectionManager.getCollection(args.collectionName);
    const env = await context.environmentManager.getActiveEnvironment();
    
    const summary: Array<{ request: string; status: number | string; success: boolean }> = [];

    for (const req of col.requests) {
      try {
        let auth;
        if (req.authProfileId) {
          auth = await context.authManager.getProfile(req.authProfileId);
        }
        const res = await context.executeRequest(req, env || undefined, auth);
        context.lastResponseCache.set(req.name, res);
        
        const success = res.status >= 200 && res.status < 400;
        summary.push({ request: req.name, status: res.status, success });
        
        if (!success) {
          break; // Stop on first error (HTTP error)
        }
      } catch (e: any) {
        summary.push({ request: req.name, status: e.message, success: false });
        break; // Stop on first error (Network error)
      }
    }

    return { content: [{ type: 'text', text: JSON.stringify(summary, null, 2) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
