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

interface Validator<T> {
  (value: T, def: T): T;
  event: (fn: (value: T) => void, def: T) => (e: any) => boolean;
}

export function validator<T>(parser: Parser<T>, ...checks: Array<(value: T) => boolean>): Validator<T> {
  return (() : Validator<T> => {
    var checker: any = (value: T, def: T) => checks.every(check => check(value)) ? value : def;

    checker.event = (fn: (value: T) => void, def: T): (e: any) => boolean => {
      return (e: any) => {
        const value = checker(parser(e.target.value), def);
        fn(value);
        return false;
      };
    };

    return checker;
  })();
}
