import {Backend, DashboardResult} from 'interfaces';

export default class MockBackend implements Backend {
  public search(): Promise<DashboardResult[]> {
    return Promise.resolve([
      {id: 'hello', title: "Hello", metadata: {}},
      {id: 'world', title: "World", metadata: {}}
    ]);
  }
};
