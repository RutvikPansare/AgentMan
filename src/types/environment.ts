export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface EnvironmentStore {
  active?: string;
  environments: Environment[];
}
