import { Environment, AuthProfile, HttpResponse } from '../types/index.js';
import { AssertionResult } from '../types/assertion.js';
import { EngineContext } from '../mcp/tools/types.js';
import { runAssertions } from './assertion-runner.js';

export interface RunOptions {
  environment?: Environment;
  auth?: AuthProfile;
  stopOnFailure?: boolean;
}

export interface RequestRunResult {
  requestName: string;
  response: HttpResponse | null;
  assertions: AssertionResult[];
  passed: boolean;
  duration: number;
  error?: string;
}

export interface CollectionRunResult {
  collection: string;
  total: number;
  passed: number;
  failed: number;
  results: RequestRunResult[];
}

export class CollectionRunner {
  private context: EngineContext;

  constructor(context: EngineContext) {
    this.context = context;
  }

  public async run(collectionName: string, options: RunOptions = {}): Promise<CollectionRunResult> {
    const collection = await this.context.collectionManager.getCollection(collectionName);
    
    const results: RequestRunResult[] = [];
    let passedCount = 0;
    let failedCount = 0;

    for (const request of collection.requests) {
      const start = Date.now();
      let passed = true;
      let response: HttpResponse | null = null;
      let assertionResults: AssertionResult[] = [];
      let error: string | undefined;

      try {
        let auth = options.auth;
        if (!auth && request.authProfileId) {
          auth = await this.context.authManager.getProfile(request.authProfileId);
        }

        response = await this.context.executeRequest(request, options.environment, auth);
        this.context.lastResponseCache.set(request.name, response);

        if (request.assertions && request.assertions.length > 0) {
          assertionResults = runAssertions(response, request.assertions);
          passed = assertionResults.every(a => a.passed);
        }
      } catch (e: any) {
        passed = false;
        error = e.message;
      }

      const duration = Date.now() - start;

      if (passed) {
        passedCount++;
      } else {
        failedCount++;
      }

      results.push({
        requestName: request.name,
        response,
        assertions: assertionResults,
        passed,
        duration,
        error
      });

      if (!passed && options.stopOnFailure) {
        break;
      }
    }

    return {
      collection: collectionName,
      total: collection.requests.length,
      passed: passedCount,
      failed: failedCount,
      results
    };
  }
}
