import * as React from 'react';

import {Filter, DashboardEntry} from 'interfaces';

interface TitleFilterJSON {
  value: string;
}

export class TitleFilter implements Filter<TitleFilterJSON> {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  public render(): any {
    return <span><em>title</em>: {this.value}</span>;
  }

  public apply(result: DashboardEntry): boolean {
    return result.title.indexOf(this.value) >= 0;
  }

  public toJSON(): any {
    return {value: this.value};
  }

  static fromJSON(json: TitleFilterJSON): TitleFilter {
    return new TitleFilter(json.value);
  }
}

interface MetadataFilterJSON {
  key: string;
  value: string;
}

export class MetadataFilter implements Filter<MetadataFilterJSON> {
  readonly key: string;
  readonly value: string;

  constructor(key: string, value: string) {
    this.key = key;
    this.value = value;
  }

  public render(): any {
    return <span>{this.key}: {this.value}</span>;
  }

  public apply(result: DashboardEntry): boolean {
    let v = result.metadata[this.key];

    if (v === undefined) {
      return false;
    }

    return v === this.value;
  }

  public toJSON(): any {
    return {key: this.key, value: this.value};
  }

  static fromJSON(json: MetadataFilterJSON): MetadataFilter {
    return new MetadataFilter(json.key, json.value);
  }
}

interface AndFilterJSON {
  filters: Filter<any>[];
}

export class AndFilter implements Filter<AndFilterJSON> {
  readonly filters: Filter<any>[];

  constructor(filters: Filter<any>[]) {
    this.filters = filters;
  }

  public render(): any {
    return <span><em>multiple</em></span>;
  }

  public apply(result: DashboardEntry): boolean {
    return this.filters.every(filter => {
      return filter.apply(result);
    });
  }

  public toJSON(): any {
    return {filters: this.filters.map(f => f.toJSON())};
  }

  static fromJSON(json: AndFilterJSON): AndFilter {
    return new AndFilter(json.filters.map(fromJSON));
  }
}

export function fromJSON(json: any) {
  switch (json.type) {
    case "metadata":
      return MetadataFilter.fromJSON(json as MetadataFilterJSON);
    case "title":
      return TitleFilter.fromJSON(json as TitleFilterJSON);
    case "and":
      return AndFilter.fromJSON(json as AndFilterJSON);
  }
}
