import * as subject from 'active-redux/redux/local';

describe('localReducer', () => {
  const person = {
    type: 'people',
    id: 5,
    attributes: {
      hair: 'black',
      age: 25,
    }
  };

  describe('initialState', () => {
    it('has an empty resources object', () => {
      expect(subject.localReducer(undefined, {})).toMatchSnapshot();
    });
  });

  describe('actions', () => {
    const reduce = subject.localReducer;

    ['localHydrate', 'localCreate', 'localRead'].forEach((actionName) => {
      describe(`${actionName}()`, () => {
        const action = subject[actionName]({ data: person });

        it('populates the state with resources', () => {
          expect(reduce(undefined, action)).toMatchSnapshot();
        });
      });
    });

    describe('localClear()', () => {
      const initialState = { resources: { [person.type]: { 1: 'foo', 2: 'bar' } } };
      const action = subject.localClear(person.type);

      it('clears the resource from state', () => {
        expect(reduce(initialState, action)).toMatchSnapshot();
      });
    });

    describe('localUpdate()', () => {
      const initialState = { resources: { [person.type]: { 1: 'foo', 2: 'bar' } } };
      const action = subject.localUpdate({ data: person });

      it('updates that resource', () => {
        expect(reduce(initialState, action)).toMatchSnapshot();
      });
    });

    describe('localDelete()', () => {
      const initialState = {
        resources: {
          [person.type]: {
            1: 'foo',
            2: 'bar',
            [person.id]: person
          }
        }
      };
      const action = subject.localDelete({ data: person });

      it('deletes that resource', () => {
        expect(reduce(initialState, action)).toMatchSnapshot();
      });
    });
  });
});
