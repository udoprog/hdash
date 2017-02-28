import { Heroic, Query, QueryResponse } from 'api/heroic';
import axios from 'axios';
import { encode, decode } from 'mapping'

export default class RealHeroic implements Heroic {
  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  queryMetrics(query: Query): Promise<QueryResponse> {
    return axios.post(this.buildUrl('/query/metrics'), encode(query))
      .then(response => {
        return decode(response.data, QueryResponse);
      }) as Promise<QueryResponse>;
  }

  private buildUrl(path: string): string {
    return `${this.url}/${path}`;
  }
};
