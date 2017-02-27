import { Heroic, Query } from 'api/heroic';
import axios from 'axios';
import { encode } from 'mapping'

export default class RealHeroic implements Heroic {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  queryMetrics(query: Query) {
    return axios.post(this.buildUrl('/query/metrics'), { data: encode(query) });
  }

  private buildUrl(path: string): string {
    return `${this.url}/${path}`;
  }
};
