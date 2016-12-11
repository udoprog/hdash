import {Backend, DashboardResult} from 'interfaces';

export default class RealBackend implements Backend {
  public search(): Promise<DashboardResult[]> {
    return Promise.resolve([
      {id: 'hello', title: "Hello"},
      {id: 'world', title: "World"}
    ]);
  }
};
