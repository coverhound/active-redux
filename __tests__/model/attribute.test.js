import { defineAttribute } from '../../src/model/attribute';

describe('defineAttribute()', () => {
  let example;
  const key = 'foo';
  const value = 'bar';
  const data = { attributes: { [key]: value} };
  const cast = (value) => value;
  class Example {
    constructor(data) { this.data = data; }
  }

  it('defines the attribute on the class', () => {
    defineAttribute({ context: Example, key, cast });
    expect(new Example(data).foo).toEqual(value);
  });
});
