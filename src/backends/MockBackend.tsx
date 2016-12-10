import {Promise} from 'es6-promise';
import {Backend, Dashboard} from 'interfaces';

export default class MockBackend implements Backend {
  public search(): Promise<Dashboard[]> {
    return Promise.resolve([
      {id: 'hello', title: "Hello"},
      {id: 'world', title: "World"}
    ]);
  }
};
