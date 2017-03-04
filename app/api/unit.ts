import { types } from 'mapping';

type Singular = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface Unit {
  constant: string;

  singular: Singular;

  format(value: number): string;

  equals(unit: Unit): boolean;
}

class MillisecondsUnit implements Unit {
  public readonly milliseconds: number;
  public readonly constant: string;
  public readonly singular: Singular;
  private readonly plural: string;

  constructor(milliseconds: number, constant: string, singular: Singular, plural: string) {
    this.milliseconds = milliseconds;
    this.constant = constant;
    this.singular = singular;
    this.plural = plural;
  }

  format(value: number): string {
    if (value == 1) {
      return `${value} ${this.singular}`
    }

    return `${value} ${this.plural}`;
  }

  equals(other: Unit): boolean {
    return other instanceof MillisecondsUnit && this.milliseconds === other.milliseconds;
  }
}

class WeeksUnit implements Unit {
  public readonly constant: string = 'weeks';
  public readonly singular: Singular = 'week';

  format(value: number): string {
    if (value == 1) {
      return `${value} week`
    }

    return `${value} weeks`;
  }

  equals(other: Unit): boolean {
    return other instanceof WeeksUnit;
  }
}

class MonthsUnit implements Unit {
  public readonly constant: string = 'months';
  public readonly singular: Singular = 'month';

  format(value: number): string {
    if (value == 1) {
      return `${value} month`
    }

    return `${value} months`;
  }

  equals(other: Unit): boolean {
    return other instanceof MonthsUnit;
  }
}

class YearsUnit implements Unit {
  public readonly constant: string = 'years';
  public readonly singular: Singular = 'year';

  format(value: number): string {
    if (value == 1) {
      return `${value} year`
    }

    return `${value} years`;
  }

  equals(other: Unit): boolean {
    return other instanceof YearsUnit;
  }
}

export const Seconds = new MillisecondsUnit(1000, 'seconds', 'second', 'seconds');
export const Minutes = new MillisecondsUnit(1000 * 60, 'minutes', 'minute', 'minutes');
export const Hours = new MillisecondsUnit(1000 * 60 * 60, 'hours', 'hour', 'hours');
export const Days = new MillisecondsUnit(1000 * 60 * 60 * 24, 'days', 'day', 'days');
export const Weeks = new WeeksUnit();
export const Months = new MonthsUnit();
export const Years = new YearsUnit();

export const UnitType = types.Const<String, Unit>(types.String, [
  Seconds,
  Minutes,
  Hours,
  Days,
  Weeks,
  Months
]);
