import { RequestConfig } from './request.js';

export interface CollectionRequest extends RequestConfig {
  id: string;
  name: string;
}

export interface Collection {
  name: string;
  description?: string;
  requests: CollectionRequest[];
}
