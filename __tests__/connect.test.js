import * as AR from 'active-redux';
import { Provider } from 'react-redux';
import React from 'react';
import mockStore from 'fixtures/store';
import { mount } from 'enzyme';

const Base = () => <div />;

AR.bind(mockStore);
const Person = AR.define('people', class Person {});

const waitFor = (delay) => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

const findPerson = (delay, error) => () => Promise.all([
  Person.find({ id: '9' }, { remote: false }),
  waitFor(delay),
]).then((data) => (
  error ? Promise.reject(error) : data[0]
));

const wrap = (Subject) => mount(
  <Provider store={mockStore}><Subject /></Provider>
).find(Base);

describe('connect', () => {
  test('loading success', async () => {
    const Subject = AR.connect({
      person: findPerson(200),
    }, {
      delay: 100,
    })(Base);
    const wrapper = wrap(Subject);

    expect(wrapper).toMatchSnapshot(); // Loading
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Past Delay
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Done
  });

  test('loading timeout', async () => {
    const Subject = AR.connect({
      person: findPerson(300),
    }, {
      delay: 100,
      timeout: 200,
    })(Base);
    const wrapper = wrap(Subject);

    expect(wrapper).toMatchSnapshot(); // Loading
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Past Delay
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Timeout
  });

  test('loading error', async () => {
    const Subject = AR.connect({
      person: findPerson(50, new Error('whoops')),
    })(Base);
    const wrapper = wrap(Subject);

    expect(wrapper).toMatchSnapshot(); // Loading
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Error
  });

  test('store changed', async () => {
    const Subject = AR.connect({
      person: findPerson(50),
    })(Base);
    const wrapper = wrap(Subject);

    expect(wrapper).toMatchSnapshot(); // Loading
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Loaded #1
    mockStore.dispatch(AR.api.apiClear('people'));
    await waitFor(100);
    expect(wrapper).toMatchSnapshot(); // Loaded #2
  });
});
