import { Optional, of, absent } from 'optional';

export type Values<T> = Partial<T>;

export class PathError extends Error {
  readonly path: Path;

  constructor(message: string, path: Path) {
    super(path.formatPath() + ": " + message);
    this.path = path;
  }
}

export interface Constructor<T> {
  new (values: Values<T>): T;

  /**
   * Access prototype.
   */
  prototype: T;
}

export interface Target {
  /**
   * Supports lookups.
   */
  [key: string]: any;
}

export interface FieldOptions {
  optional?: boolean;
}

export interface Field<T> {
  optional: boolean;

  descriptor: string;

  decode(value: any, path: Path): T;

  encode(value: T, path: Path): any;

  equals(a: T, b: T): boolean;
}

export interface FieldType<T> {
  toField(options: FieldOptions): Field<T>;
}

class Path {
  readonly name: string | null;
  readonly parent?: Path;

  constructor(name: string | null, parent?: Path) {
    this.name = name;
    this.parent = parent;
  }

  public extend(name: string): Path {
    return new Path(name, this);
  }

  public error(message: string): Error {
    return new PathError(message, this);
  }

  public formatPath(): string {
    const full: string[] = [];

    var current: Path = this;

    while (current) {
      if (!current.parent) {
        full.push(`[${current.name}]`);
        break;
      }

      if (current.name[0] === "[") {
        full.push(current.name);
      } else {
        full.push(`.${current.name}`);
      }

      current = current.parent;
    }

    return full.reverse().join("");
  }
}

interface TypeCheck {
  check: (value: any) => boolean;
  description: string;
}

class AssignField<T> implements Field<T> {
  private readonly typeCheck: TypeCheck;
  public readonly optional: boolean;
  public readonly descriptor: string = '=';

  constructor(typeCheck: TypeCheck, optional: boolean) {
    this.typeCheck = typeCheck;
    this.optional = optional;
  }

  public decode(value: any, path: Path): any {
    if (!this.typeCheck.check(value)) {
      throw path.error(`value has wrong type: ${typeof value}, expected: ${this.typeCheck.description}`);
    }

    return value;
  }

  public encode(value: any): any {
    return value;
  }

  public equals(a: any, b: any): boolean {
    return a === b;
  }
}

class AssignFieldType<T> implements FieldType<T> {
  public static __ft = true;

  readonly typeCheck: TypeCheck;

  constructor(typeCheck: TypeCheck) {
    this.typeCheck = typeCheck;
  }

  toField(options: FieldOptions) {
    return new AssignField<T>(this.typeCheck, options.optional);
  }
}

export type ToFieldType<T> = FieldType<T> | Constructor<T>;

function toField<T>(argument: ToFieldType<T>): FieldType<T> {
  if (argument.constructor && (argument.constructor as any).__ft) {
    return argument as FieldType<T>;
  }

  return new ClassFieldType<T>(argument as Constructor<T>);
}

interface TypeMapping<T> {
  type: string;
  target: ToFieldType<T>;
}

interface HasType {
  type: string;
}

class SubField<T extends Target> implements Field<T> {
  readonly typeFunction: (input: T) => string;
  readonly types: { [s: string]: Field<any> };
  readonly optional: boolean;
  readonly descriptor: string;

  constructor(typeFunction: (input: T) => string, types: { [s: string]: Field<any> }, optional: boolean) {
    this.typeFunction = typeFunction;
    this.types = types;
    this.optional = optional;
    this.descriptor = '?';
  }

  public decode(value: any, path: Path): T {
    const type = value['type'];

    if (!type) {
      throw path.error("missing field: type");
    }

    const sub = this.types[type];

    if (!sub) {
      throw path.error("does not correspond to a sub-type: " + type);
    }

    return sub.decode(value, path);
  }

  public encode(value: T, path?: Path): any {
    const type = this.typeFunction(value);
    const sub = this.types[type];

    if (!sub) {
      const expected = Object.keys(this.types).join(", ");
      throw path.error(`does not correspond to a sub-type: ${type}, expected one of: ${expected}`);
    }

    const values = sub.encode(value, path);
    values['type'] = type;
    return values;
  }

  public equals(a: T, b: T): boolean {
    if (a.constructor.prototype !== b.constructor.prototype) {
      return false;
    }

    return equals(a, b);
  }
}

class SubFieldType<T extends Target & HasType> implements FieldType<T> {
  public static __ft = true;

  readonly typeFunction: (input: T) => string;
  readonly types: { [s: string]: FieldType<any> };

  constructor(typeFunction: (input: T) => string, types: TypeMapping<any>[]) {
    const mapTypes: { [s: string]: FieldType<any> } = {};

    types.forEach(type => {
      mapTypes[type.type] = toField(type.target);
    })

    this.typeFunction = typeFunction;
    this.types = mapTypes;
  }

  public toField(options: FieldOptions): Field<T> {
    const types: { [key: string]: Field<T> } = {};

    Object.keys(this.types).forEach(key => {
      types[key] = this.types[key].toField(options);
    });

    return new SubField<T>(this.typeFunction, types, options.optional);
  }
}

class ArrayField<T extends Target> implements Field<Array<T>> {
  readonly inner: Field<T>;
  readonly optional: boolean;
  readonly descriptor: string;

  constructor(inner: Field<T>, optional: boolean) {
    this.inner = inner;
    this.optional = optional;
    this.descriptor = `[${this.inner.descriptor}]`
  }

  public decode(value: any, path: Path): Array<T> {
    if (!(value instanceof Array)) {
      throw path.error("expected array, got: " + String(value));
    }

    return value.map((v: any, index: number) => {
      return this.inner.decode(v, path.extend(`[${index}]`));
    });
  }

  public encode(value: Array<T>, path: Path): any {
    return value.map((v: any, index: number) => {
      return this.inner.encode(v, path.extend(`[${index}]`));
    });
  }

  public equals(a: Array<T>, b: Array<T>): boolean {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((value, index) => {
      return this.inner.equals(value, b[index]);
    });
  }
}

class ArrayFieldType<T extends Target> implements FieldType<Array<T>> {
  public static __ft = true;

  readonly inner: FieldType<T>;

  constructor(inner: FieldType<T>) {
    this.inner = inner;
  }

  public toField(options: FieldOptions): Field<Array<T>> {
    return new ArrayField<T>(this.inner.toField(options), options.optional);
  }
}

class MapField<T extends Target> implements Field<{ [key: string]: T }> {
  readonly value: Field<T>;
  readonly optional: boolean;
  readonly descriptor: string;

  constructor(value: Field<T>, optional: boolean) {
    this.value = value;
    this.optional = optional;
    this.descriptor = `{[key: string]: ${this.value.descriptor}}`;
  }

  public decode(input: any, path: Path): { [s: string]: T } {
    const output: { [s: string]: T } = {};

    Object.keys(input).forEach(key => {
      output[key] = this.value.decode(input[key], path.extend(key));
    });

    return output;
  }

  public encode(input: { [s: string]: T }, path: Path): any {
    const output: { [s: string]: T } = {};

    Object.keys(input).forEach(key => {
      output[key] = this.value.encode(input[key], path.extend(key));
    });

    return output;
  }

  public equals(a: T, b: T): boolean {
    return equals(a, b);
  }
}

class MapFieldType<T extends Target> implements FieldType<{ [key: string]: T }> {
  public static __ft = true;

  readonly value: FieldType<T>;

  constructor(value: FieldType<T>) {
    this.value = value;
  }

  public toField(options: FieldOptions): Field<{ [key: string]: T }> {
    return new MapField<T>(this.value.toField(options), options.optional);
  }
}

class ClassField<T extends Target> implements Field<T> {
  readonly con: Constructor<T>;
  readonly optional: boolean;
  readonly descriptor: string;

  constructor(con: Constructor<T>, optional?: boolean) {
    this.con = con;
    this.optional = !!optional;
    this.descriptor = con.name;
  }

  public decode(input: any, path: Path): T {
    if (!(input instanceof Object)) {
      throw path.error(`expected object, got: ${input}`);
    }

    const values: Values<any> = {};

    const fields = (this.con.prototype as any).__fields as { [s: string]: Field<any> } || {};

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const value = input[key];

      if (value === undefined || value == null) {
        if (!field.optional) {
          throw path.extend(key).error("missing value");
        } else {
          values[key] = absent<any>();
        }
      }

      if (field.optional) {
        values[key] = of(field.decode(value, path.extend(key)));
      } else {
        values[key] = field.decode(value, path.extend(key));
      }
    });

    return new this.con(values);
  }

  public encode(input: T, path: Path): any {
    const values: { [s: string]: any } = {};
    const proto = this.con.prototype;
    const fields = (proto as any).__fields as { [s: string]: Field<any> } || {};

    Object.keys(fields).forEach(key => {
      const field = fields[key];
      const value = input[key];

      if (field.optional) {
        (value as Optional<any>).accept(value => {
          values[key] = field.encode(value, path.extend(key));
        });
      } else {
        values[key] = field.encode(value, path.extend(key));
      }
    });

    return values;
  }

  public equals(a: T, b: T): boolean {
    return equals(a, b);
  }
}

class ClassFieldType<T extends Target> implements FieldType<T> {
  public static __ft = true;

  readonly con: Constructor<T>;

  constructor(con: Constructor<T>) {
    this.con = con;
  }

  public toField(options: FieldOptions): Field<T> {
    return new ClassField<T>(this.con, options.optional);
  }
}

export function equals<T extends Target>(a: T, b: T): boolean {
  if (a === null || b === null) {
    return a === b;
  }

  if (a === undefined || b === undefined) {
    return a === b;
  }

  /* required check to guarantee same prototype */
  if (a.constructor !== b.constructor) {
    return false;
  }

  const proto = a.constructor.prototype;
  const fields = proto.__fields as { [s: string]: Field<any> } || {};

  return Object.keys(fields).every(key => {
    return fields[key].equals(a[key], b[key]);
  });
}

export function field<T>(type: ToFieldType<T>, options?: FieldOptions): any {
  return function (target: T, fieldKey: any) {
    const fields: { [s: string]: Field<any> } = (target as any).__fields = (target as any).__fields || {};
    fields[fieldKey] = toField(type).toField(options || {});
  };
}

/**
 * Decode the given object.
 */
export function decode<T>(input: any, type: ToFieldType<T>): T {
  const field = toField(type).toField({ optional: false });
  const p: Path = new Path(field.descriptor);
  return field.decode(input, p);
}

export function encode<T extends Target>(input: T, type?: ToFieldType<T>): { [s: string]: any } {
  const field = (type && toField(type) || toField((<any>input).constructor as Constructor<T>)).toField({ optional: false });
  const p: Path = new Path(field.descriptor);
  return field.encode(input, p);
}

/**
 * Perform a shallow clone of the given object.
 */
export function clone<T extends Target, K extends keyof T>(input: T, overrides?: Pick<T, K>): T {
  const values: { [s: string]: any } = {};

  const constructor = (<any>input).constructor;
  const proto = constructor.prototype;
  const fields: { [s: string]: FieldType<any> } = proto.__fields || {};

  Object.keys(fields).forEach(key => {
    values[key] = input[key];
  });

  /* assign specified overrides */
  if (overrides) {
    Object.keys(overrides).forEach(key => {
      if (fields[key] === undefined) {
        throw new Error(String(constructor.name) + ": field does not exist: " + key);
      }

      values[key] = overrides[key];
    });
  }

  return new constructor(values);
}

export function mutate<T extends Target, K extends keyof T>(input: T, overrides: Pick<T, K>): T {
  const constructor = (<any>input).constructor;
  const proto = constructor.prototype;
  const fields: { [s: string]: FieldType<any> } = proto.__fields || {};

  Object.keys(overrides).forEach(key => {
    if (fields[key] === undefined) {
      throw new Error(`${String(constructor.name)}: field does not exist: ${key}`);
    }

    input[key] = overrides[key];
  });

  return input;
}

export namespace types {
  export const String: FieldType<string> = new AssignFieldType({
    check: (value: any) => typeof value === 'string',
    description: 'string'
  })

  export const Number: FieldType<number> = new AssignFieldType({
    check: (value: any) => typeof value === 'number',
    description: 'number'
  })

  export const Boolean: FieldType<boolean> = new AssignFieldType({
    check: (value: any) => typeof value === 'boolean',
    description: 'boolean'
  })

  export const Any: FieldType<any> = new AssignFieldType({
    check: (_value: any) => true,
    description: 'any'
  })

  export function Map<T>(value: ToFieldType<T>): MapFieldType<T> {
    return new MapFieldType<T>(toField<T>(value));
  };

  export function Array<T>(inner: ToFieldType<T>): ArrayFieldType<T> {
    return new ArrayFieldType<T>(toField<T>(inner));
  };

  export function SubTypes<T>(types: (HasType & Constructor<T>)[]): SubFieldType<T & HasType> {
    return new SubFieldType<T & HasType>(
      input => input.type,
      types.map(t => {
        return { type: t.type, target: t } as TypeMapping<T>;
      })
    );
  }
}
