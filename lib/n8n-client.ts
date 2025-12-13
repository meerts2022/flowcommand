export interface N8nInstance {
  id: string;
  name: string;
  url: string;
  apiKey: string;
}

export interface Workflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Execution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf: string;
  status: string;
  startedAt: string;
  stoppedAt: string;
  workflowId: string;
  waitTill?: string;
}

export interface ExecutionError {
  message: string;
  description?: string;
  context?: any;
  stack?: string;
  cause?: any;
}

export interface NodeExecutionData {
  error?: ExecutionError;
  startTime?: number;
  executionTime?: number;
  source?: any[];
  data?: any;
}

export interface ExecutionDetail extends Execution {
  data?: {
    resultData?: {
      error?: ExecutionError;
      runData?: Record<string, NodeExecutionData[]>;
      lastNodeExecuted?: string;
    };
    executionData?: any;
  };
}

interface N8nApiResponse<T> {
  data: T;
  nextCursor?: string;
}

export class N8nClient {
  constructor(private instance: N8nInstance) { }

  private getBaseUrl(): string {
    try {
      let urlStr = this.instance.url;
      // Remove trailing slash
      if (urlStr.endsWith('/')) {
        urlStr = urlStr.slice(0, -1);
      }

      // Common UI paths to strip if the user pasted the browser URL
      const uiPaths = ['/home/workflows', '/home', '/workflows', '/credentials', '/executions'];

      for (const path of uiPaths) {
        if (urlStr.endsWith(path)) {
          urlStr = urlStr.slice(0, -path.length);
        }
      }

      // Clean up again in case of multiple suffixes or trailing slashes after strip
      return urlStr.replace(/\/$/, '');
    } catch (e) {
      return this.instance.url.replace(/\/$/, '');
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<N8nApiResponse<T>> {
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1${endpoint}`;
    const headers = {
      'X-N8N-API-KEY': this.instance.apiKey,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`N8n API Error: ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`);
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
    }
  }

  async getAllWorkflows(): Promise<Workflow[]> {
    let allWorkflows: Workflow[] = [];
    let nextCursor: string | undefined = undefined;

    do {
      const queryParams = new URLSearchParams();
      if (nextCursor) queryParams.append('cursor', nextCursor);
      queryParams.append('limit', '250'); // Max usually allowed per page

      // We cast the response data to Workflow[] because the API returns { data: Workflow[], nextCursor: ... }
      // but our generic fetch returns N8nApiResponse<T>, so T here is Workflow[]
      const response = await this.fetch<Workflow[]>(`/workflows?${queryParams.toString()}`);
      allWorkflows = allWorkflows.concat(response.data);
      nextCursor = response.nextCursor;
    } while (nextCursor);

    return allWorkflows;
  }

  async getWorkflows(limit = 100): Promise<Workflow[]> {
    const response = await this.fetch<Workflow[]>(`/workflows?limit=${limit}`);
    return response.data;
  }

  async getExecutions(limit = 10, status?: 'success' | 'error' | 'waiting' | 'running'): Promise<Execution[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit.toString());
    if (status) queryParams.append('status', status);

    const response = await this.fetch<Execution[]>(`/executions?${queryParams.toString()}`);
    return response.data;
  }

  async getExecutionsSince(since: Date): Promise<Execution[]> {
    let allExecutions: Execution[] = [];
    let nextCursor: string | undefined = undefined;
    let shouldStop = false;

    do {
      const queryParams = new URLSearchParams();
      if (nextCursor) queryParams.append('cursor', nextCursor);
      queryParams.append('limit', '50'); // Reduced from 250 to avoid 502 timeouts on large payloads

      try {
        const response = await this.fetch<Execution[]>(`/executions?${queryParams.toString()}`);
        const pageExecutions = response.data;

        if (pageExecutions.length === 0) break;

        // Check if we've reached past the date
        for (const exec of pageExecutions) {
          if (new Date(exec.startedAt) < since) {
            shouldStop = true;
          } else {
            allExecutions.push(exec);
          }
        }

        if (shouldStop) break;

        nextCursor = response.nextCursor;
      } catch (error) {
        console.warn('Failed to fetch a page of executions, returning partial results:', error);
        break; // Stop fetching more pages but return what we have
      }
    } while (nextCursor);

    return allExecutions;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Use the authenticated API endpoint instead of /healthz
      // This is more reliable as /healthz may not exist on all n8n versions
      await this.fetch<Workflow[]>('/workflows?limit=1');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async getExecutionDetail(executionId: string): Promise<ExecutionDetail> {
    // Note: The /executions/{id} endpoint returns the execution directly, not wrapped in {data: ...}
    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/api/v1/executions/${executionId}?includeData=true`;
    const headers = {
      'X-N8N-API-KEY': this.instance.apiKey,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, { headers });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`N8n API Error: ${response.status} ${response.statusText}${text ? `: ${text}` : ''}`);
    }

    try {
      const execution = JSON.parse(text);
      return execution as ExecutionDetail;
    } catch (e) {
      throw new Error(`Invalid JSON response from execution detail: ${text.substring(0, 100)}...`);
    }
  }
}
