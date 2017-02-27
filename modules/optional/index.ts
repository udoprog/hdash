export interface Optional<T> {
  present: boolean;

  /**
   * Map the value to another type if present.
   */
  map<U>(fn: (input: T) => U): Optional<U>;

  /**
   * Flat map the value if present.
   */
  flatMap<U>(fn: (input: T) => Optional<U>): Optional<U>;

  /**
   * Unwrap the value if present, or provide another value instead.
   */
  orElse(provided: T): T;

  /**
   * Unwrap the value if present, or supply another value instead.
   */
  orElseGet(supplier: () => T): T;

  /**
   * Run the given consumer if the value is present.
   */
  accept(consumer: (value: T) => void, onElse?: () => void): void;

  /**
   * Get the value if present, or null if absent.
   */
  get(): T | null;
};

export function ofNullable<T>(value: T | null | undefined): Optional<T> {
  return (value === null || value === undefined) ? absent<T>() : of(value);
}

export function of<T>(value: T): Optional<T> {
  return new Present<T>(value);
}

export function absent<T>(): Optional<T> {
  return new Absent<T>();
}

class Present<T> implements Optional<T> {
  readonly present: boolean = true;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  public map<U>(fn: (input: T) => U): Optional<U> {
    return new Present<U>(fn(this.value));
  }

  public flatMap<U>(fn: (input: T) => Optional<U>): Optional<U> {
    return fn(this.value);
  }

  public orElse(_value: T): T {
    return this.value;
  }

  public orElseGet(_supplier: () => T): T {
    return this.value;
  }

  public accept(consumer: (value: T) => void, _onElse?: () => void): void {
    consumer(this.value);
  }

  public get(): T | null {
    return this.value;
  }
}

class Absent<T> implements Optional<T> {
  readonly present: boolean = false;

  public map<U>(_fn: (input: T) => U): Optional<U> {
    return this as any as Absent<U>;
  }

  public flatMap<U>(_fn: (input: T) => Optional<U>): Optional<U> {
    return this as any as Absent<U>;
  }

  public orElse(provided: T): T {
    return provided;
  }

  public orElseGet(supplier: () => T): T {
    return supplier();
  }

  public accept(_consumer: (value: T) => void, onElse?: () => void): void {
    if (onElse) {
      onElse();
    }
  }

  public get(): T | null {
    return null;
  }
}
