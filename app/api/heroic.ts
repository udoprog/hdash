import { field, types, Values } from 'mapping';

export interface Range {
}

class RelativeRange implements Range {
  static type = 'relative';

  @field(types.Number)
  readonly value: number;
  @field(types.String)
  readonly unit: string;

  constructor(values: Values<RelativeRange>) {
    this.value = values.value;
    this.unit = values.unit;
  }
}

class AbsoluteRange implements Range {
  @field(types.Number)
  readonly start: number;
  @field(types.Number)
  readonly end: number;

  constructor(values: Values<AbsoluteRange>) {
    this.start = values.start;
    this.end = values.end;
  }

  static type = 'absolute';
}

export const RangeType = types.SubTypes<Range>([
  RelativeRange,
  AbsoluteRange
]);

export class Sampling {
  @field(types.Number)
  readonly size: number;
  @field(types.Number)
  readonly unit: string;

  constructor(values: Values<Sampling>) {
    this.size = values.size;
    this.unit = values.unit;
  }
}

export interface Aggregation {
}

export class SumAggregation implements Aggregation {
  @field(Sampling)
  readonly sampling: Sampling;

  constructor(values: Values<SumAggregation>) {
    this.sampling = values.sampling;
  }

  static type = 'sum';
}

export const AggregationType = types.SubTypes<Aggregation>([
  SumAggregation
]);

export class QueryResult {
  @field(types.String)
  readonly type: string;

  @field(types.String)
  readonly hash: string;

  @field(types.Number)
  readonly cadence: number;

  @field(types.Any)
  readonly values: any[];

  constructor(values: Values<QueryResult>) {
    this.type = values.type;
    this.hash = values.hash;
    this.cadence = values.cadence;
    this.values = values.values;
  }
}

export class QueryRange {
  @field(types.Number)
  readonly start: number;
  @field(types.Number)
  readonly end: number;

  constructor(values: Values<QueryRange>) {
    this.start = values.start;
    this.end = values.end;
  }
}

export class QueryResponse {
  @field(QueryRange)
  readonly range: QueryRange;

  @field(types.Array(QueryResult))
  readonly result: QueryResult[];

  @field(types.Number)
  readonly cadence: number;

  constructor(values: Values<QueryResponse>) {
    this.range = values.range;
    this.result = values.result;
    this.cadence = values.cadence;
  }
}

export class Query {
  @field(RangeType)
  readonly range: Range;

  @field(types.String)
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
