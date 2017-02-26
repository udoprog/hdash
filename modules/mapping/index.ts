type Target<T> = { new (): T };

export function field(options?: { type: Type<any> }): any {
  const {type}: { type?: Type<any> } = options || {};

  return (cls: any, fieldKey: any): any => {
    cls[fieldKey] = type || new SimpleType();
    return cls;
  };
}

interface Type<T> {
  deserialize(value: any): T;
}

class SimpleType implements Type<any> {
  public deserialize(value: any): any {
    return value;
  }
}

interface TypeMapping {
  type: string;
  target: Target<any>;
}

export class TypeField<T> implements Type<T> {
  readonly types: { [s: string]: Target<any> };

  constructor(types: TypeMapping[]) {
    const mapTypes: { [s: string]: Target<any> } = {};

    types.forEach(type => {
      mapTypes[type.type] = type.target;
    })

    this.types = mapTypes;
  }

  public deserialize(value: any): T {
    const type = value['type'];

    if (!type) {
      throw new Error("missing field: type");
    }

    const sub = this.types[type];

    if (!sub) {
      throw new Error("does not correspond to a sub-type: " + type);
    }

    return deserialize(value, sub);
  }
}

export class ArrayType<T> implements Type<Array<T>> {
  readonly inner: Target<T>;

  constructor(inner: Target<T>) {
    this.inner = inner;
  }

  public deserialize(value: any): Array<T> {
    return value.map((v: any) => {
      return deserialize(v, this.inner);
    });
  }
}

export function deserialize<T>(json: any, cls: Target<T>): T {
  const instance: any = new cls();

  Object.keys(cls.prototype).forEach(key => {
    const field = cls.prototype[key];
    const value = json[key];
    instance[key] = field.deserialize(value);
  });

  return instance;
}

export function clone<T>(input: T, cls: Target<T>): T {
  const instance: any = new cls();
  const source = input as any;

  Object.keys(cls.prototype).forEach(key => {
    instance[key] = source[key];
  });

  return instance;
}
