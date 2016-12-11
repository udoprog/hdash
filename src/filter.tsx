import * as React from 'react';

import {Filter} from 'interfaces';

export class TitleFilter implements Filter {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  public render(): any {
    return <span><em>title</em>: {this.value}</span>;
  }
}

export class MetadataFilter implements Filter {
  readonly key: string;
  readonly value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }

  public render(): any {
    return <span>{this.key}: {this.value}</span>;
  }
}

export class AndFilter implements Filter {
  readonly filters: Filter[];

  constructor(filters: Filter[]) {
    this.filters = filters;
  }

  public render(): any {
    return <span><em>multiple</em></span>;
  }
}
