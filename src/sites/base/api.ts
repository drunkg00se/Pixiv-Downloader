import { RequestError } from '@/lib/error';
import { logger } from '@/lib/logger';

export class ApiBase {
  async getHtml(url: string): Promise<string> {
    logger.info('Fetch url:', url);
    const res = await fetch(url);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.text();
  }

  async getDoc(url: string): Promise<Document> {
    const html = await this.getHtml(url);
    return new DOMParser().parseFromString(html, 'text/html');
  }

  async getJSON<T extends object>(url: string, init?: RequestInit): Promise<T> {
    logger.info('Fetch url:', url);
    const res = await fetch(url, init);
    if (!res.ok) throw new RequestError(res.url, res.status);
    return await res.json();
  }
}
