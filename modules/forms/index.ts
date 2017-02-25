/**
 * Function that handles an event as a numeric value.
 */
export function numberEvent<T>(fn: (value: number | null) => T): (e: any) => T {
  return e => {
    const n = parseInt(e.target.value);
    return isNaN(n) ? null : fn(n);
  };
}

interface Parser<T> {
  (value: string): T;
}

interface Encoder<T> {
  (value: T): string;
}

interface ValidationSuccess {
}

interface ValidationError {
  type: string;
  message: string;
}

type ValidationResult = ValidationSuccess | ValidationError;

interface ArrayValidator<T> {
  (value: T): ValidationError[];
}

/**
 * A single validation check.
 */
interface Check<T> {
  (value: T): boolean | ValidationResult;
}

interface ValidatorBindConfig<T> {
  onChange?: (value: T) => any;
}

interface ValidatorBind<T> {
  (accessor: () => T, config: ValidatorBindConfig<T>): BoundValidator<T>;
}

interface Validator<T> {
  (value: T | null, defaultValue: T): T;

  parse(value: string | null, defaultValue: T): T;

  bind: ValidatorBind<T>;
}

interface ValidatorConfig<T> {
  checks?: Array<Check<T>> | Check<T>;
}

const integerParser = (value: string): number => {
  const v = parseInt(value);
  return isNaN(v) ? null : v;
};

const integerEncoder = (value: number): string => {
  return value.toString();
};

const noop = function(): void {
}

const EMPTY: any = {};

const buildValidator = <T>(
  parser: Parser<T>, encoder: Encoder<T>, defaultFormValue: string,
  check: ArrayValidator<T>
): Validator<T> => {
  return ((): Validator<T> => {
    let validator: any = function(value: number, defaultValue: number) {
      return value === null ? defaultValue : value;
    };

    validator.parse = (value: string, defaultValue: T): T => {
      const v = parser(value);

      if (v === null) {
        return defaultValue;
      }

      if (check(v).length !== 0) {
        return defaultValue;
      }

      return v;
    };

    validator.bind = (accessor: () => T, config: ValidatorBindConfig<T>) => {
      const onChange = config.onChange ? config.onChange : noop;
      return new BoundValidator(onChange, accessor, parser, encoder, defaultFormValue, check);
    };

    return validator;
  })();
}

const BOOLEAN_FAIL = {
  type: "general",
  message: "Validation failed"
} as ValidationError;

export namespace validators {
  export const Integer = 'Integer';

  export function integer(config: ValidatorConfig<number>): Validator<number> {
    return validator(Integer, config);
  }

  /**
   * Validate that the lowest legal value is the given value.
   */
  export function min(expected: number): Check<number> {
    return value => {
      if (value < expected) {
        return {type: "min", message: "Value too small"} as ValidationError;
      }

      return OK;
    };
  }

  /**
   * Validate that the highest legal value is the given value.
   */
  export function max(expected: number): Check<number> {
    return value => {
      if (value > expected) {
        return {type: "min", message: "Value too large"} as ValidationError;
      }

      return OK;
    };
  }
}

export const OK = {} as ValidationSuccess;

export class BoundValidator<T> {
  /**
   * Current errors detected.
   */
  $errors: { [s: string]: ValidationError; };

  /**
   * Check if the given keys are valid or not.
   */
  $valid: boolean;

  private readonly _onChange: (value: T) => any;
  private readonly _accessor: () => T;
  private readonly _parser: Parser<T>;
  private readonly _encoder: Encoder<T>;
  private readonly _defaultFormValue: string;
  private readonly _check: ArrayValidator<T>;

  constructor(
    onChange: (value: T) => any,
    accessor: () => T,
    parser: Parser<T>,
    encoder: Encoder<T>,
    defaultFormValue: string,
    check: ArrayValidator<T>,
  ) {
    this.$errors = EMPTY;
    this.$valid = true;

    this._onChange = onChange;
    this._accessor = accessor;
    this._parser = parser;
    this._encoder = encoder;
    this._defaultFormValue = defaultFormValue;
    this._check = check;

    this.onChange = this.onChange.bind(this);
  }

  public get(defaultValue: T): T {
    const v = this._accessor();

    if (v === null) {
      return defaultValue;
    }

    const results = this._check(v);

    if (results.length !== 0) {
      return defaultValue;
    }

    return v;
  }

  public value(): string {
    const v = this._accessor();
    return v === null ? this._defaultFormValue : this._encoder(v);
  }

  /**
   * Call the given consumer if the encapsulated value is valid.
   */
  public ifValid(consumer: (value: T) => void): void {
    const v = this._accessor();

    if (v === null) {
      return;
    }

    if (this._check(v).length === 0) {
      consumer(v);
    }
  }

  /**
   * Bind an onChange handler that will only fire child handler if the value is valid.
   */
  public onChange(e: any): void {
    const v = this._parser(e.target.value);
    const results = this._check(v);

    this._onChange(v);

    if (results.length === 0) {
      this.$errors = EMPTY;
      this.$valid = true;
    } else {
      const errors: any = this.$errors = {};
      this.$valid = false;

      results.forEach(result => {
        errors[result.type] = result;
      });
    }
  }
}

export function validator<T>(type: string, config: ValidatorConfig<T>): Validator<T> {
  const check: ArrayValidator<any> = (() => {
    let checks: any;

    if (!(config.checks instanceof Array)) {
      checks = [config.checks];
    } else {
      checks = config.checks as Check<T>[];
    }

    return (value: any) => {
      return checks.map((check: any) => {
        const result = check(value);

        if (typeof(result) === "boolean") {
          return result ? OK : BOOLEAN_FAIL;
        }

        return result as ValidationResult;
      })
      .filter((result: any) => result !== OK)
      .map((result: any) => result as ValidationError);
    };
  })();

  if (type === validators.Integer) {
    return buildValidator(integerParser, integerEncoder, "0", check) as Validator<any>;
  }

  throw new Error("Illegal type: " + type);
}
