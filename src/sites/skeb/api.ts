import { ApiBase } from '../base/api';
import type { SkebUser, SkebWork, SkebWorkListItem } from './types';

export class SkebApi extends ApiBase {
  private getAuthHeaders(): RequestInit {
    let token: string | null = null;
    try {
      token = localStorage.getItem('token');
    } catch {
      // ignore
    }
    return {
      headers: {
        Authorization: `Bearer ${token ?? 'null'}`
      }
    };
  }

  getUser(screenName: string) {
    return this.getJSON<SkebUser>(`https://skeb.jp/api/users/${screenName}`, this.getAuthHeaders());
  }

  getWorks(screenName: string, offset: number, limit = 30) {
    return this.getJSON<SkebWorkListItem[]>(
      `https://skeb.jp/api/users/${screenName}/works?role=creator&sort=date&offset=${offset}&limit=${limit}`,
      this.getAuthHeaders()
    );
  }

  getWork(screenName: string, workNumber: number) {
    return this.getJSON<SkebWork>(
      `https://skeb.jp/api/users/${screenName}/works/${workNumber}`,
      this.getAuthHeaders()
    );
  }
}
