import { field, types, Values } from 'mapping';
import { Optional } from 'optional';

export interface Range {
  type: string;
}

class RelativeRange implements Range {
  static type = 'relative';

  get type(): string {
    return RelativeRange.type;
  }

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
  static type = 'absolute';

  get type(): string {
    return AbsoluteRange.type;
  }

  @field(types.Number)
  readonly start: number;
  @field(types.Number)
  readonly end: number;

  constructor(values: Values<AbsoluteRange>) {
    this.start = values.start;
    this.end = values.end;
  }
}

export const RangeType = types.SubTypes<Range>([
  RelativeRange, AbsoluteRange
]);

export class Sampling {
  @field(types.Number)
  readonly size: number;
  @field(types.String)
  readonly unit: string;

  constructor(values: Values<Sampling>) {
    this.size = values.size;
    this.unit = values.unit;
  }
}

export interface Aggregation {
  type: string;
}

export class SumAggregation implements Aggregation {
  static type = 'sum';

  get type(): string {
    return SumAggregation.type;
  }

  @field(Sampling)
  readonly sampling: Sampling;

  constructor(values: Values<SumAggregation>) {
    this.sampling = values.sampling;
  }
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

  @field(types.Optional(types.Number))
  readonly cadence: Optional<number>;

  constructor(values: Values<QueryResponse>) {
    this.range = values.range;
    this.result = values.result;
    this.cadence = values.cadence;
  }
}

export class QueryOptions {
  @field(types.Number)
  readonly ticksGoal: number;

  constructor(values: Values<QueryOptions>) {
    this.ticksGoal = values.ticksGoal;
  }
}

export class Query {
  @field(RangeType)
  readonly range: Range;

  @field(types.String)
  readonly query: string;

  @field(QueryOptions)
  readonly options: QueryOptions;

  constructor(values: Values<Query>) {
    this.range = values.range;
    this.query = values.query;
    this.options = values.options;
  }
}

export interface Heroic {
  queryMetrics(query: Query): Promise<QueryResponse>;
}

export interface HeroicContext {
  heroic: Heroic;
}
