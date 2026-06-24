import { ToolDefinition, ToolHandlerResult, EngineContext } from './types.js';
import { EnvironmentNotFoundError } from '../../engine/environment-manager.js';

export const definition: ToolDefinition = {
  name: 'set_variable',
  description: 'Set a key-value pair in a named environment. Creates the environment if it does not exist.',
  inputSchema: {
    type: 'object',
    properties: {
      environment: { type: 'string' },
      key: { type: 'string' },
      value: { type: 'string' }
    },
    required: ['environment', 'key', 'value']
  }
};

export async function handler(args: any, context: EngineContext): Promise<ToolHandlerResult> {
  try {
    try {
      await context.environmentManager.updateVariable(args.environment, args.key, args.value);
    } catch (e: any) {
      if (e instanceof EnvironmentNotFoundError) {
        await context.environmentManager.createEnvironment(args.environment, { [args.key]: args.value });
      } else {
        throw e;
      }
    }
    return { content: [{ type: 'text', text: JSON.stringify({ success: true, environment: args.environment, key: args.key, value: args.value }) }] };
  } catch (e: any) {
    return { content: [{ type: 'text', text: e.message }], isError: true };
  }
}
