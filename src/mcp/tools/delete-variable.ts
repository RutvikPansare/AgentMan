import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'delete_variable',
  description: 'Remove a variable from an environment.',
  inputSchema: {
    type: 'object',
    properties: {
      environment: { type: 'string' },
      key: { type: 'string' }
    },
    required: ['environment', 'key']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    const env = await context.environmentManager.getEnvironment(args.environment);
    const newVars = { ...env.variables };
    delete newVars[args.key];
    await context.environmentManager.updateEnvironment(args.environment, newVars);
    
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, environment: args.environment, deletedKey: args.key }) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
