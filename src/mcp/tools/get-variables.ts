import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';

export const definition: ToolDefinition = {
  name: 'get_variables',
  description: 'List all variables in a named environment (or the active environment if no name given).',
  inputSchema: {
    type: 'object',
    properties: {
      environment: { type: 'string' }
    }
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    let env;
    if (args.environment) {
      env = await context.environmentManager.getEnvironment(args.environment);
    } else {
      env = await context.environmentManager.getActiveEnvironment();
      if (!env) {
        throw new Error('No active environment is set.');
      }
    }
    
    const vars = Object.entries(env.variables).map(([key, value]) => ({ key, value }));
    return { content: [{ type: 'text', text: JSON.stringify(vars) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
