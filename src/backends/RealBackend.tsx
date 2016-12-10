import {Promise} from 'es6-promise';
import {Backend, Dashboard} from 'interfaces';

export default class RealBackend implements Backend {
  public search(): Promise<[Dashboard]> {
    return Promise.resolve([
      {id: 'hello', title: "Hello"},
      {id: 'world', title: "World"}
    ]);
  }
};
