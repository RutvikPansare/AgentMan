import { RequestConfig, Environment } from '../types/index.js';
import { ResponseStore } from './response-store.js';

export function substitute(
  template: string, 
  variables: Record<string, string> = {}, 
  responseStore?: ResponseStore
): string {
  if (!template) return template;
  
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmed = key.trim();
    
    // 1. Try simple variables object (from environment)
    if (variables[trimmed] !== undefined) {
      return variables[trimmed];
    }

    // 2. Try ResponseStore chaining
    if (responseStore && trimmed.includes('.response.')) {
      const val = responseStore.getValue(trimmed);
      if (val !== undefined) {
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      }
    }
    
    // 3. Unresolved, keep original
    return match;
  });
}

export function substituteConfig<T extends RequestConfig>(
  config: T, 
  variables: Record<string, string> = {}, 
  responseStore?: ResponseStore
): T {
  const newConfig: T = { ...config };
  
  if (config.url) {
    newConfig.url = substitute(config.url, variables, responseStore);
  }

  if (config.headers) {
    newConfig.headers = {};
    for (const [k, v] of Object.entries(config.headers)) {
      newConfig.headers[k] = substitute(v, variables, responseStore);
    }
  }

  if (config.params) {
    newConfig.params = {};
    for (const [k, v] of Object.entries(config.params)) {
      newConfig.params[k] = substitute(v, variables, responseStore);
    }
  }

  if (typeof config.body === 'string') {
    newConfig.body = substitute(config.body, variables, responseStore);
  }

  return newConfig;
}
