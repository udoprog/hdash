import { field, TypeField, Values } from 'mapping';

export interface Heroic {
}

export interface HeroicContext {
  heroic: Heroic;
}

export interface Range {
}

class RelativeRange implements Range {
  static type = 'relative';

  @field()
  readonly size: number;
  @field()
  readonly unit: string;

  constructor(values: Values<RelativeRange>) {
    this.size = values.size;
    this.unit = values.unit;
  }
}

class AbsoluteRange implements Range {
  @field()
  readonly start: number;
  @field()
  readonly end: number;

  constructor(values: Values<AbsoluteRange>) {
    this.start = values.start;
    this.end = values.end;
  }

  static type = 'absolute';
}

export const RangeType = TypeField.of<Range>([RelativeRange, AbsoluteRange]);

export class Sampling {
  @field()
  readonly size: number;
  @field()
  readonly unit: string;

  constructor(values: Values<Sampling>) {
    this.size = values.size;
    this.unit = values.unit;
  }
}

export interface Aggregation {
}

export class SumAggregation implements Aggregation {
  @field({ type: Sampling })
  readonly sampling: Sampling;

  constructor(values: Values<SumAggregation>) {
    this.sampling = values.sampling;
  }

  static type = 'sum';
}

export const AggregationType = TypeField.of<Aggregation>([
  SumAggregation
]);

export class Query {
  @field({ type: RangeType })
  readonly range: Range;

  @field()
  readonly query: string;

  constructor(values: Values<Query>) {
    this.range = values.range;
    this.query = values.query;
  }
}
