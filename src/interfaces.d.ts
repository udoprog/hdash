import {Promise} from 'es6-promise';

// services
declare namespace interfaces {
  interface Backend {
    search(): Promise<Dashboard[]>;
  }
}

declare namespace interfaces {
  interface Dashboard {
    id: string,
    title: string
  }

  interface PagesContext {
    db: Backend
  }
}

export = interfaces;
