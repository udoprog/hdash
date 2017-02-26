import { Optional, absent, of } from 'optional';

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
  (value: string): Optional<T>;
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

const INVALID_ERROR = { type: 'invalid', message: 'Value not valid' } as ValidationError;

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
  (accessor: () => Optional<T>, config: ValidatorBindConfig<T>): BoundValidator<T>;
}

interface Validator<T> {
  (value: T | null): Optional<T>;

  parse(value: string | null): Optional<T>;

  bind: ValidatorBind<T>;
}

interface ValidatorConfig<T> {
  checks?: Array<Check<T>> | Check<T>;
}

const integerParser = (value: string): Optional<number> => {
  const v = parseInt(value);
  return isFinite(v) ? of(v) : absent<number>();
};

const integerEncoder = (value: number): string => {
  return value.toString();
};

const noop = function (): void {
}

const EMPTY: any = {};

const buildValidator = <T>(
  parser: Parser<T>,
  encoder: Encoder<T>,
  check: ArrayValidator<T>,
  defaultValue: T
): Validator<T> => {
  return ((): Validator<T> => {
    let validator: any = function (value: number): Optional<number> {
      return value === null ? absent<number>() : of(value);
    };

    validator.parse = (value: string): Optional<T> => {
      return parser(value).flatMap(v => {
        if (check(v).length !== 0) {
          return absent<T>();
        }

        return of(v);
      });
    };

    validator.bind = (accessor: () => Optional<T>, config: ValidatorBindConfig<T>) => {
      const onChange = config.onChange ? config.onChange : noop;
      const validator = new BoundValidator(onChange, accessor, parser, encoder, check, defaultValue);
      validator.checkCurrent();
      return validator;
    };

    return validator;
  })();
}

const BOOLEAN_FAIL = {
  type: "general",
  message: "Validation failed"
} as ValidationError;

export namespace validators {
  export const Integer = 'integer';
  export const String = 'string';

  export function integer(config: ValidatorConfig<number>): Validator<number> {
    return validator(Integer, config);
  }

  /**
   * Validate that the lowest legal value is the given value.
   */
  export function min(expected: number): Check<number> {
    return value => {
      if (value < expected) {
        return {
          type: "min",
          message: "Value too small, expected at least: " + expected
        } as ValidationError;
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
        return {
          type: "max",
          message: "Value too large, expected at most: " + expected
        } as ValidationError;
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
   * Feedback string.
   */
  $feedback?: string;

  /**
   * Check if the given keys are valid or not.
   */
  $valid: boolean;

  /**
   * The state of the current vallidation.
   * Suitable for providing as validationState to react-bootstrap forms.
   */
  $validationState?: "success" | "warning" | "error";

  private readonly _onChange: (value: T) => any;
  private readonly _accessor: () => Optional<T>;
  private readonly _parser: Parser<T>;
  private readonly _encoder: Encoder<T>;
  private readonly _check: ArrayValidator<T>;
  private readonly _defaultValue: T;

  constructor(
    onChange: (value: T) => any,
    accessor: () => Optional<T>,
    parser: Parser<T>,
    encoder: Encoder<T>,
    check: ArrayValidator<T>,
    defaultValue: T
  ) {
    this.$errors = EMPTY;
    this.$feedback = null;
    this.$valid = true;
    this.$validationState = null;

    this._onChange = onChange;
    this._accessor = accessor;
    this._parser = parser;
    this._encoder = encoder;
    this._check = check;
    this._defaultValue = defaultValue;

    this.onChange = this.onChange.bind(this);
  }

  public get(): Optional<T> {
    return this._accessor().flatMap(v => {
      return this._check(v).length !== 0 ? absent<T>() : of(v);
    });
  }

  public value(): string {
    return this._encoder(this._accessor().orElse(this._defaultValue));
  }

  /**
   * Bind an onChange handler that will only fire child handler if the value is valid.
   */
  public onChange(e: any): void {
    const v = this._parser(e.target.value);
    this.check(v);
    this._onChange(v.orElse(this._defaultValue));
  }

  /**
   * Check the current value provided by the accessor.
   */
  public checkCurrent() {
    this.check(this._accessor());
  }

  public check(v: Optional<T>) {
    v.accept(v => {
      const results = this._check(v);

      if (results.length === 0) {
        this.$errors = EMPTY;
        this.$valid = true;
        this.$feedback = null;
        this.$validationState = 'success';
      } else {
        const errors: any = this.$errors = {};

        var feedback: Array<string> = [];

        results.forEach(result => {
          feedback.push(result.message);
          errors[result.type] = result;
        });

        this.$feedback = feedback.join(', ');
        this.$valid = false;
        this.$validationState = 'error';
      }
    }, () => {
      this.$errors = {};
      this.$errors[INVALID_ERROR.type] = INVALID_ERROR;
      this.$valid = false;
      this.$feedback = "Not a valid value";
      this.$validationState = 'error';
    });
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

        if (typeof (result) === "boolean") {
          return result ? OK : BOOLEAN_FAIL;
        }

        return result as ValidationResult;
      })
        .filter((result: any) => result !== OK)
        .map((result: any) => result as ValidationError);
    };
  })();

  if (type === validators.Integer) {
    return buildValidator(integerParser, integerEncoder, check, 0) as Validator<any>;
  }

  if (type === validators.String) {
    return buildValidator(s => of(s), s => s, check, "") as Validator<any>;
  }

  throw new Error("Illegal type: " + type);
}
