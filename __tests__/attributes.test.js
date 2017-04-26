import { Attr } from '../src';

const testNoDefault = (type) => {
  describe('with no default set', () => {
    test('undefined stays undefined', () => {
      const casting = Attr[type]();
      expect(casting(undefined)).toEqual(undefined);
    });
  });
};

const testDefault = (casting, defaultValue) => {
  test('sets the default for undefined', () => {
    expect(casting(undefined)).toEqual(defaultValue);
  });

  test('doesn\'t coerce null', () => {
    expect(casting(null)).toEqual(null);
  });
};

describe('Attr', () => {
  describe('.string()', () => {
    const defaultValue = 'foo';

    testNoDefault('string');

    describe('with a default set', () => {
      const casting = Attr.string({ default: defaultValue });

      testDefault(casting, defaultValue);

      test('coerces numbers into their string equivalent', () => {
        expect(casting(0)).toEqual("0");
      });

      test('keeps a string as a string', () => {
        expect(casting("")).toEqual("");
      });
    });
  });

  describe('.number()', () => {
    const defaultValue = 5;

    testNoDefault('number');

    describe('with a default set', () => {
      const casting = Attr.number({ default: defaultValue });

      testDefault(casting, defaultValue);

      test('strings into their number equivalent', () => {
        expect(casting("0")).toEqual(0);
      });

      test('keeps a number as a number', () => {
        expect(casting(3)).toEqual(3);
      });
    });
  });

  describe('.date()', () => {
    const defaultValue = Date.parse('2015-02-02');

    testNoDefault('date');

    describe('with a default set', () => {
      const casting = Attr.date({ default: defaultValue });

      testDefault(casting, defaultValue);

      test('strings into their date equivalent', () => {
        const from = '2015-02-02 00:00';
        const to = new Date(from);
        expect(casting(from)).toEqual(to);
      });

      test('coerces numbers into their date equivalent', () => {
        const from = 1422835200000;
        const to = new Date('2015-02-02');
        expect(casting(from)).toEqual(to)
      });

      test('keeps a date a date', () => {
        const date = new Date();
        expect(casting(date)).toEqual(date);
      });
    });
  });

  describe('.boolean()', () => {
    const defaultValue = true;

    testNoDefault('boolean');

    describe('with a default set', () => {
      const casting = Attr.boolean({ default: defaultValue });

      testDefault(casting, defaultValue);

      test('strings into their boolean equivalent', () => {
        expect(casting('')).toBe(false);
        expect(casting('f')).toBe(true);
      });

      test('coerces numbers into their boolean equivalent', () => {
        expect(casting(0)).toBe(false);
        expect(casting(1)).toBe(true);
      });

      test('keeps a boolean a boolean', () => {
        expect(casting(false)).toBe(false);
      });
    });
  });

  describe('.array()', () => {
    const casting = Attr.array();

    test('wraps non-arrays in an array', () => {
      const date = new Date();
      expect(casting('foo')).toEqual(['foo']);
      expect(casting(123)).toEqual([123]);
      expect(casting(date)).toEqual([date]);
    });

    test('leaves arrays as arrays', () => {
      const array = [1, 2, 3];
      expect(casting(array)).toBe(array);
    });
  });

  describe('.object()', () => {
    const casting = Attr.object();

    test('turns non-objects into an object', () => {
      expect(casting('foo')).toEqual({});
      expect(casting(123)).toEqual({});
    });

    test('keeps objects objects', () => {
      const obj = { foo: 'bar' };
      expect(casting(obj)).toBe(obj);
    });
  });
});
