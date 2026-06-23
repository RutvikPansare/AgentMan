export enum AuthType {
  BEARER = 'bearer',
  API_KEY = 'apiKey',
  BASIC = 'basic'
}

export interface AuthProfile {
  id: string;
  name: string;
  type: AuthType;
  credentials: Record<string, string>;
}
