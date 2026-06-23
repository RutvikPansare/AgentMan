export type AssertionField = 'status' | 'body' | 'latency';
export type AssertionOperator = 'eq' | 'neq' | 'contains' | 'lt' | 'gt';

export interface Assertion {
  field: AssertionField;
  /** For body, dot-notation path like data.token */
  path?: string;
  operator: AssertionOperator;
  value: string | number;
}

export interface AssertionResult {
  passed: boolean;
  assertion: Assertion;
  actual: unknown;
  message: string;
}
