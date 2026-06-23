import { Assertion, AssertionResult, HttpResponse } from '../types/index.js';

export function extractBodyValue(body: unknown, path?: string): unknown {
  if (!path || typeof body !== 'object' || body === null) return body;
  const parts = path.split('.');
  let current: any = body;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export function runAssertions(response: HttpResponse, assertions: Assertion[]): AssertionResult[] {
  return assertions.map(assertion => {
    let actual: unknown;
    
    switch (assertion.field) {
      case 'status':
        actual = response.status;
        break;
      case 'latency':
        actual = response.latency;
        break;
      case 'body':
        actual = extractBodyValue(response.body, assertion.path);
        break;
    }

    let passed = false;
    
    switch (assertion.operator) {
      case 'eq':
        passed = actual === assertion.value;
        break;
      case 'neq':
        passed = actual !== assertion.value;
        break;
      case 'contains':
        passed = typeof actual === 'string' && actual.includes(String(assertion.value));
        break;
      case 'lt':
        passed = typeof actual === 'number' && actual < Number(assertion.value);
        break;
      case 'gt':
        passed = typeof actual === 'number' && actual > Number(assertion.value);
        break;
    }

    const message = passed 
      ? 'Assertion passed'
      : `Expected ${assertion.field}${assertion.path ? '.' + assertion.path : ''} to ${assertion.operator} ${assertion.value}, got ${actual}`;

    return {
      passed,
      assertion,
      actual,
      message
    };
  });
}
