export default {
  people: {
    9: {
      type: 'people',
      id: '9',
      attributes: {
        'first-name': 'Dan',
        'last-name': 'Gebhardt',
        twitter: 'dgeb'
      },
      links: {
        self: 'http://example.com/people/9'
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
};
