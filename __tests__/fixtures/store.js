import { createStore } from 'redux';
import reducer from '../../src/api/reducer';

const initialState = {
  api: {
    people: {
      9: {
        type: 'people',
        id: '9',
        attributes: {
          'first-name': 'Dan',
          'last-name': 'Gebhardt',
          twitter: 'dgeb',
          address: {
            road: '123 Main St'
          }
        },
        links: {
          self: 'http://example.com/people/9'
        }
      },
      14: {
        type: 'people',
        id: '14',
        attributes: {
          'first-name': 'Bob',
          'last-name': 'Dyland',
          twitter: 'shredmaster',
          address: {
            road: 'A different Road'
          }
        },
        links: {
          self: 'http://example.com/people/14'
        }
      }
    },
    comments: {
      5: {
        type: 'comments',
        id: '5',
        attributes: {
          body: 'First!'
        },
        relationships: {
          author: {
            data: { type: 'people', id: '2' }
          }
        },
        links: {
          self: 'http://example.com/comments/5'
        }
      },
      12: {
        type: 'comments',
        id: '12',
        attributes: {
          body: 'I like XML better'
        },
        relationships: {
          author: {
            data: { type: 'people', id: '9' }
          }
        },
        links: {
          self: 'http://example.com/comments/12'
        }
      }
    }
  }
};

export default createStore(reducer, initialState);
