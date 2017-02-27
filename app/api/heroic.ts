import { field, Field, TypeField } from 'mapping';

export interface Heroic {
}

export interface HeroicContext {
  heroic: Heroic;
}

export interface Range {
}

class RelativeRange implements Range {
  static type = 'relative';
}

class AbsoluteRange implements Range {
  static type = 'absolute';
}

export const RangeType = TypeField.of([RelativeRange, AbsoluteRange]);

export class Sampling {
  @field()
  readonly size: number;
  @field()
  readonly unit: string;

  constructor(values: any) {
    this.size = values.size;
    this.unit = values.unit;
  }
}

export interface Aggregation {
}

export class SumAggregation implements Aggregation {
  @field({ type: Sampling })
  readonly sampling: Sampling;

  constructor(values: any) {
    this.sampling = values.sampling;
  }

  static type = 'sum';
}

export const AggregationType: Field<Aggregation> = TypeField.of<Aggregation>([SumAggregation]);

export class Query {
  @field({ type: RangeType })
  readonly range: Range;

  constructor(values: any) {
    this.range = values.range;
  }
}
