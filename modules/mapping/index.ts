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
}

export interface Target {
  /**
   * Supports lookups.
   */
  [key: string]: any;
}

export interface Field<T> {
  descriptor: string;

  decode(value: any, path: Path): T;

  encode(value: T, path: Path, consumer: (value: any) => void): void;

  equals(a: T, b: T): boolean;
}

export interface FieldType<T> {
  toField(): Field<T>;
}

export class Path {
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

class OptionalField<T> implements Field<Optional<T>> {
  readonly inner: Field<T>;
  readonly descriptor: string;

  constructor(inner: Field<T>) {
    this.inner = inner;
    this.descriptor = `Optional<${this.inner.descriptor}>`;
  }

  public decode(input: any, path: Path): Optional<T> {
    if (input === null || input === undefined) {
      return absent<T>();
    }

    return of<T>(this.inner.decode(input, path));
  }

  public encode(input: Optional<T>, _path: Path, consumer: (value: T) => void) {
    input.accept(consumer);
  }

  public equals(a: Optional<T>, b: Optional<T>): boolean {
    return equals(a, b);
  }
}

class OptionalFieldType<T extends Target> implements FieldType<Optional<T>> {
  public static __ft = true;

  readonly inner: FieldType<T>;

  constructor(inner: FieldType<T>) {
    this.inner = inner;
  }

  public toField(): Field<Optional<T>> {
    return new OptionalField<T>(this.inner.toField());
  }
}

class AssignField<T> implements Field<T> {
  private readonly typeCheck: TypeCheck;
  public readonly descriptor: string = '=';

  constructor(typeCheck: TypeCheck) {
    this.typeCheck = typeCheck;
  }

  public decode(value: any, path: Path): any {
    if (value === undefined || value === null) {
      throw path.error('missing value');
    }

    if (!this.typeCheck.check(value)) {
      throw path.error(`value has wrong type: ${typeof value}, expected: ${this.typeCheck.description}`);
    }

    return value;
  }

  public encode(value: any, _path: Path, consumer: (value: any) => void) {
    consumer(value);
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

  toField() {
    return new AssignField<T>(this.typeCheck);
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
  readonly descriptor: string;

  constructor(typeFunction: (input: T) => string, types: { [s: string]: Field<any> }) {
    this.typeFunction = typeFunction;
    this.types = types;
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

  public encode(value: T, path: Path, consumer: (value: any) => void) {
    const type = this.typeFunction(value);
    const sub = this.types[type];

    if (!sub) {
      const expected = Object.keys(this.types).join(", ");
      throw path.error(`does not correspond to a sub-type: ${type}, expected one of: ${expected}`);
    }

    sub.encode(value, path, values => {
      values['type'] = type;
      consumer(values);
    });
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

  public toField(): Field<T> {
    const types: { [key: string]: Field<T> } = {};

    Object.keys(this.types).forEach(key => {
      types[key] = this.types[key].toField();
    });

    return new SubField<T>(this.typeFunction, types);
  }
}

class OneOfField<T> implements Field<T> {
  readonly field: Field<T>;
  readonly values: T[];
  readonly descriptor: string;

  constructor(field: Field<T>, values: T[]) {
    this.field = field;
    this.values = values;
    this.descriptor = `[${values.map(v => String(v))}]`;
  }

  public decode(value: any, path: Path): T {
    const v = this.field.decode(value, path);

    if (this.values.find(expected => this.field.equals(expected, v)) === null) {
      throw path.error(`found value ${v}, but expected one of: ${this.values}`);
    }

    return v;
  }

  public encode(value: T, path: Path, consumer: (value: any) => void) {
    if (this.values.find(expected => this.field.equals(expected, value)) === null) {
      throw path.error(`found value ${value}, but expected one of: ${this.values}`);
    }

    this.field.encode(value, path, consumer);
  }

  public equals(a: T, b: T): boolean {
    return this.field.equals(a, b);
  }
}

class OneOfFieldType<T> implements FieldType<T> {
  public static __ft = true;

  readonly type: FieldType<T>;
  readonly values: T[];

  constructor(type: FieldType<T>, values: T[]) {
    this.type = type;
    this.values = values;
  }

  public toField(): OneOfField<T> {
    return new OneOfField<T>(this.type.toField(), this.values);
  }
}

interface HasConstant<T> {
  constant: T;
}

class ConstField<T, U extends HasConstant<T>> implements Field<U> {
  readonly field: Field<T>;
  readonly constants: U[];
  readonly descriptor: string;

  constructor(field: Field<T>, constants: U[]) {
    this.field = field;
    this.constants = constants;
    this.descriptor = `[${constants.map(v => String(v.constant))}]`;
  }

  public decode(input: any, path: Path): U {
    const v = this.field.decode(input, path);
    const out: U = this.constants.find(expected => this.field.equals(expected.constant, v));

    if (out === null) {
      throw path.error(`found value ${v}, but expected one of: ${this.constants}`);
    }

    return out;
  }

  public encode(value: U, path: Path, consumer: (value: any) => void) {
    this.field.encode(value.constant, path, consumer);
  }

  public equals(a: U, b: U): boolean {
    return this.field.equals(a.constant, b.constant);
  }
}

class ConstFieldType<T, U extends HasConstant<T>> implements FieldType<U> {
  public static __ft = true;

  readonly type: FieldType<T>;
  readonly constants: U[];

  constructor(type: FieldType<T>, constants: U[]) {
    this.type = type;
    this.constants = constants;
  }

  public toField(): ConstField<T, U> {
    return new ConstField<T, U>(this.type.toField(), this.constants);
  }
}

class ArrayField<T extends Target> implements Field<Array<T>> {
  readonly inner: Field<T>;
  readonly descriptor: string;

  constructor(inner: Field<T>) {
    this.inner = inner;
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

  public encode(value: Array<T>, path: Path, consumer: (value: any) => void) {
    const values: any[] = [];

    value.forEach((v: any, index: number) => {
      this.inner.encode(v, path.extend(`[${index}]`), value => values.push(value));
    });

    consumer(values);
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

  public toField(): Field<Array<T>> {
    return new ArrayField<T>(this.inner.toField());
  }
}

class MapField<T extends Target> implements Field<{ [key: string]: T }> {
  readonly value: Field<T>;
  readonly descriptor: string;

  constructor(value: Field<T>) {
    this.value = value;
    this.descriptor = `{[key: string]: ${this.value.descriptor}}`;
  }

  public decode(input: any, path: Path): { [s: string]: T } {
    const output: { [s: string]: T } = {};

    Object.keys(input).forEach(key => {
      output[key] = this.value.decode(input[key], path.extend(key));
    });

    return output;
  }

  public encode(input: { [s: string]: T }, path: Path, consumer: (value: any) => void) {
    const output: { [s: string]: T } = {};

    Object.keys(input).forEach(key => {
      this.value.encode(input[key], path.extend(key), value => output[key] = value);
    });

    consumer(output);
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

  public toField(): Field<{ [key: string]: T }> {
    return new MapField<T>(this.value.toField());
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
      values[key] = field.decode(value, path.extend(key));
    });

    return new this.con(values);
  }

  public encode(input: T, path: Path, consumer: (value: any) => void) {
    const values: { [s: string]: any } = {};
    const proto = this.con.prototype;
    const fields = (proto as any).__fields as { [s: string]: Field<any> } || {};

    Object.keys(fields).forEach(key => {
      fields[key].encode(input[key], path.extend(key), (value) => values[key] = value)
    });

    consumer(values);
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

  public toField(): Field<T> {
    return new ClassField<T>(this.con);
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

export function field<T>(type: ToFieldType<T>): any {
  return function (target: T, fieldKey: any) {
    const fields: { [s: string]: Field<any> } = (target as any).__fields = (target as any).__fields || {};
    fields[fieldKey] = toField(type).toField();
  };
}

/**
 * Decode the given object.
 */
export function decode<T>(input: any, type: ToFieldType<T>): T {
  const field = toField(type).toField();
  const p: Path = new Path(field.descriptor);
  return field.decode(input, p);
}

export function encode<T extends Target>(input: T, type?: ToFieldType<T>): { [s: string]: any } {
  const field = (type && toField(type) || toField((<any>input).constructor as Constructor<T>)).toField();
  const p: Path = new Path(field.descriptor);

  var returnValue = null;
  field.encode(input, p, value => returnValue = value);

  if (returnValue === null) {
    throw p.error('encode returned no value');
  }

  return returnValue;
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
  export function Optional<T>(inner: ToFieldType<T>) {
    return new OptionalFieldType<T>(toField<T>(inner));
  }

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

  export function OneOf<T>(type: FieldType<T>, values: T[]): OneOfFieldType<T> {
    return new OneOfFieldType<T>(type, values);
  }

  export function Const<T, U extends HasConstant<T>>(type: FieldType<T>, constants: U[]): ConstFieldType<T, U> {
    return new ConstFieldType<T, U>(type, constants);
  }
}
