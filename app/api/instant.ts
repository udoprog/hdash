import { field, types, Values, FieldType, Field, FieldOptions, Path } from 'mapping';

import * as moment from 'moment';
import * as unit from './unit';

class MomentField implements Field<moment.Moment> {
  public readonly optional: boolean;
  public readonly descriptor: string;
  private readonly inner: Field<number>;

  constructor(optional: boolean, inner: Field<number>) {
    this.optional = optional;
    this.descriptor = 'Moment';
    this.inner = inner;
  }

  decode(value: any, path: Path): moment.Moment {
    return moment(this.inner.decode(value, path));
  }

  encode(value: moment.Moment): any {
    return value.valueOf();
  }

  equals(_a: moment.Moment, _b: moment.Moment): boolean {
    return false;
  }
}

class MomentFieldType implements FieldType<moment.Moment> {
  public static __ft: boolean = true;

  toField(options: FieldOptions): MomentField {
    return new MomentField(options.optional, types.Number.toField(options));
  }
}

export class Duration {
  @field(types.Number)
  public readonly value: number;
  @field(unit.UnitType)
  public readonly unit: unit.Unit;

  constructor(values: Values<Duration>) {
    this.value = values.value;
    this.unit = values.unit;
  }

  equals(other: Duration): boolean {
    return other.value === this.value && other.unit.equals(this.unit);
  }
}

export interface Instant {
  render(): string;

  moment(now: moment.Moment): moment.Moment;

  equals(other: Instant): boolean;
}

/**
 * An instant at a very specific point in time.
 */
export class Absolute implements Instant {
  static type: string = 'absolute';

  get type(): string {
    return Absolute.type;
  }

  @field(new MomentFieldType())
  public readonly when: moment.Moment;

  constructor(values: Values<Absolute>) {
    this.when = values.when;
  }

  render(): string {
    return this.when.format();
  }

  moment(_now: moment.Moment): moment.Moment {
    return this.when;
  }

  equals(other: Instant): boolean {
    return other instanceof Absolute && other.when.isSame(this.when);
  }
}

/**
 * A relative range that has a specific offset.
 */
export class StartOf implements Instant {
  static type: string = 'start-of';

  get type(): string {
    return StartOf.type;
  }

  @field(unit.UnitType)
  public readonly unit: unit.Unit;
  @field(Duration)
  public readonly offset: Duration;

  constructor(values: Values<EndOf>) {
    this.unit = values.unit;
    this.offset = values.offset;
  }

  moment(now: moment.Moment): moment.Moment {
    return now.clone()
      .subtract(this.offset.value, this.offset.unit.singular)
      .startOf(this.unit.singular);
  }

  render(): string {
    if (this.offset.value === 0) {
      if (this.unit === unit.Days) {
        return 'beginning of today';
      }

      return `beginning of this ${this.unit.singular}`;
    }

    if (this.offset.value === 1) {
      if (this.offset.unit === unit.Days) {
        return 'beginning of yesterday';
      }

      if (this.unit === unit.Days) {
        return `beginning of this day last ${this.offset.unit.singular}`;
      }

      return `beginning of last ${this.offset.unit.singular}`;
    }

    if (this.offset.value === 2 && this.offset.unit === unit.Days) {
      return `beginning of the ${this.unit.singular} before yesterday`;
    }

    return `beginning of ${this.offset.unit.format(this.offset.value)} ago`;
  }

  equals(other: Instant): boolean {
    return (
      other instanceof StartOf &&
      other.unit.equals(this.unit) &&
      other.offset.equals(this.offset)
    );
  }
}

/**
 * A relative range, rounded to the given unit that has a specific offset.
 */
export class EndOf implements Instant {
  static type: string = 'end-of';

  get type(): string {
    return EndOf.type;
  }

  @field(unit.UnitType)
  public readonly unit: unit.Unit;
  @field(Duration)
  public readonly offset: Duration;

  constructor(values: Values<EndOf>) {
    this.unit = values.unit;
    this.offset = values.offset;
  }

  render(): string {
    if (this.offset.value === 0) {
      if (this.unit === unit.Days) {
        return 'end of today';
      }

      return `end of this ${this.unit.singular}`;
    }

    if (this.offset.value === 1) {
      if (this.offset.unit === unit.Days) {
        return 'end of yesterday';
      }

      if (this.unit === unit.Days) {
        return `end of this day last ${this.offset.unit.singular}`;
      }

      return `end of last ${this.offset.unit.singular}`;
    }

    if (this.offset.value === 2 && this.offset.unit === unit.Days) {
      return `end of the ${this.unit.singular} before yesterday`;
    }

    return `end of ${this.offset.unit.format(this.offset.value)} ago`;
  }

  moment(now: moment.Moment): moment.Moment {
    return now.clone()
      .subtract(this.offset.value, this.offset.unit.singular)
      .endOf(this.unit.singular);
  }

  equals(other: Instant): boolean {
    return (
      other instanceof EndOf &&
      other.unit.equals(this.unit) &&
      other.offset.equals(this.offset)
    );
  }
}

/**
 * A range that goes back in time the given unit and value.
 */
export class Now implements Instant {
  static type: string = 'now';

  get type(): string {
    return Now.type;
  }

  constructor(_values: Values<Now>) {
  }

  render(): string {
    return 'now';
  }

  moment(now: moment.Moment): moment.Moment {
    return now;
  }

  equals(other: Instant): boolean {
    return other instanceof Now;
  }
}

export const InstantType = types.SubTypes<Instant>([
  EndOf,
  StartOf,
  Now,
  Absolute
]);
