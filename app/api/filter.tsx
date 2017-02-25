import * as React from 'react';

import { DashboardEntry } from 'api/interfaces';

export interface Filter<JSON> {
  render(): any;

  apply(result: DashboardEntry): boolean;

  toJSON(): JSON;

  type(): string;

  equals(other: Filter<any>): boolean;
}

interface TitleFilterJSON {
  value: string;
}

export class TitleFilter implements Filter<TitleFilterJSON> {
  static TYPE = 'title';

  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  public render(): any {
    return <span><b>title</b>: {this.value}</span>;
  }

  public apply(result: DashboardEntry): boolean {
    return result.title.indexOf(this.value) >= 0;
  }

  public toJSON(): any {
    return { type: TitleFilter.TYPE, value: this.value };
  }

  public type(): string {
    return TitleFilter.TYPE;
  }

  public equals(other: Filter<any>): boolean {
    if (TitleFilter.TYPE !== other.type()) {
      return false;
    }

    const o = other as TitleFilter;
    return this.value === o.value;
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
  static TYPE = 'metadata';

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
    return { type: MetadataFilter.TYPE, key: this.key, value: this.value };
  }

  public type(): string {
    return MetadataFilter.TYPE;
  }

  public equals(other: Filter<any>): boolean {
    if (MetadataFilter.TYPE !== other.type()) {
      return false;
    }

    const o = other as MetadataFilter;

    return this.key === o.key && this.value === o.value;
  }

  static fromJSON(json: MetadataFilterJSON): MetadataFilter {
    return new MetadataFilter(json.key, json.value);
  }
}

interface AndFilterJSON {
  filters: Filter<any>[];
}

export class AndFilter implements Filter<AndFilterJSON> {
  static TYPE = "and";

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
    return { type: AndFilter.TYPE, filters: this.filters.map(f => f.toJSON()) };
  }

  public type(): string {
    return AndFilter.TYPE;
  }

  public equals(other: Filter<any>): boolean {
    if (AndFilter.TYPE !== other.type()) {
      return false;
    }

    const o = other as AndFilter;

    if (this.filters.length !== o.filters.length) {
      return false;
    }

    return this.filters.every((f, index) => f.equals(o.filters[index]));
  }

  static fromJSON(json: AndFilterJSON): AndFilter {
    return new AndFilter(json.filters.map(fromJSON));
  }
}

export function fromJSON(json: any): Filter<any> {
  switch (json.type) {
    case MetadataFilter.TYPE:
      return MetadataFilter.fromJSON(json as MetadataFilterJSON);
    case TitleFilter.TYPE:
      return TitleFilter.fromJSON(json as TitleFilterJSON);
    case AndFilter.TYPE:
      return AndFilter.fromJSON(json as AndFilterJSON);
  }
}
