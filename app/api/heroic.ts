import { field, TypeField, ArrayField, Values } from 'mapping';

export interface Range {
}

class RelativeRange implements Range {
  static type = 'relative';

  @field()
  readonly value: number;
  @field()
  readonly unit: string;

  constructor(values: Values<RelativeRange>) {
    this.value = values.value;
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

export const RangeType = TypeField.of<Range>([
  RelativeRange,
  AbsoluteRange
]);

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

export class QueryResult {
  @field()
  readonly type: string;

  @field()
  readonly hash: string;

  @field()
  readonly cadence: number;

  @field()
  readonly values: any[];

  constructor(values: Values<QueryResult>) {
    this.type = values.type;
    this.hash = values.hash;
    this.cadence = values.cadence;
    this.values = values.values;
  }
}

export class QueryRange {
  @field()
  readonly start: number;
  @field()
  readonly end: number;

  constructor(values: Values<QueryRange>) {
    this.start = values.start;
    this.end = values.end;
  }
}

export class QueryResponse {
  @field({ type: QueryRange })
  readonly range: QueryRange;

  @field({ type: new ArrayField(QueryResult) })
  readonly result: QueryResult[];

  @field({})
  readonly cadence: number;

  constructor(values: Values<QueryResponse>) {
    this.range = values.range;
    this.result = values.result;
    this.cadence = values.cadence;
  }
}

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

export interface Heroic {
  queryMetrics(query: Query): Promise<QueryResponse>;
}

export interface HeroicContext {
  heroic: Heroic;
}
