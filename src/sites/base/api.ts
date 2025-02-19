import { RequestError } from '@/lib/error';
import { logger } from '@/lib/logger';
import PQueue from 'p-queue';

export class ApiBase {
  private queue: PQueue;
  protected fetch: typeof window.fetch;

  constructor(rateLimit = 4) {
    this.queue = new PQueue({ interval: 1000, intervalCap: rateLimit });

    this.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      return this.queue.add(() => fetch(input, init), { throwOnTimeout: true });
    };
  }

  async getHtml(url: string): Promise<string> {
    logger.info('Fetch url:', url);
    const res = await this.fetch(url);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.text();
  }

  async getDoc(url: string): Promise<Document> {
    const html = await this.getHtml(url);
    return new DOMParser().parseFromString(html, 'text/html');
  }

  async getJSON<T extends object>(url: string, init?: RequestInit): Promise<T> {
    logger.info('Fetch url:', url);
    const res = await this.fetch(url, init);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.json();
  }
}
