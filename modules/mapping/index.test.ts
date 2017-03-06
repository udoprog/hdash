import { types, field, decode, Values } from './'
import { Optional } from 'optional';

class Fields {
  @field(types.Number)
  public readonly numberField: number;
  @field(types.String)
  public readonly stringField: string;
  @field(types.OneOf(types.String, ['foo', 'bar']))
  public readonly oneOfField: 'foo' | 'bar';
  @field(types.Optional(types.String))
  public readonly optionalStringField: Optional<string>;

  constructor(values: Values<Fields>) {
    this.numberField = values.numberField;
    this.stringField = values.stringField;
    this.oneOfField = values.oneOfField;
    this.optionalStringField = values.optionalStringField;
  }
}

describe(Fields.name, () => {
  it('should decode correctly', () => {
    const decoded = decode({
      numberField: 1234,
      stringField: 'string',
      oneOfField: 'foo'
    }, Fields);

    expect(decoded.numberField).toBe(1234);
    expect(decoded.stringField).toBe('string');
    expect(decoded.oneOfField).toBe('foo');
    expect(decoded.optionalStringField.get()).toBe(null);
  });
})