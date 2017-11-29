import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { Attr, bind, define } from 'active-redux';
import jsonApiData from 'fixtures/json-api-body';
import createMockStore from 'fixtures/store';

const mockStore = createMockStore();
const article = jsonApiData.data[0];
const [person, ...comments] = jsonApiData.included;
const mockAxios = new MockAdapter(axios);
const httpHeaders = { 'content-type': 'application/json' };

describe('define', () => {
  test('sets the type', () => {
    const Article = define('bazinga', class Article {});
    expect(Article.type).toEqual('bazinga');
  });

  test('defines attribute methods', () => {
    const Article = define('foo', class Article {
      static attributes = {
        title: Attr.string()
      };
    });
    const subject = new Article(article);
    expect(subject.title).toEqual(article.attributes.title);
  });

  test('defines hasOne methods', async () => {
    define('people', class Person {});
    const Comment = define('comments', class Comment {
      static attributes = {
        author: Attr.hasOne('people'),
      };
    });

    mockAxios.onGet(`people/${person.id}`).replyOnce(200, { data: person }, httpHeaders);
    const comment = new Comment(comments[0]);
    const result = await comment.author();
    expect(result).toMatchSnapshot();
  });

  test('defines hasMany methods', async () => {
    const Person = define('people', class Person {
      static attributes = {
        comments: Attr.hasMany('comments'),
      }
    });

    mockAxios.onGet(`comments/${comments[0].id}`).replyOnce(200, { data: comments[0] }, httpHeaders);
    mockAxios.onGet(`comments/${comments[1].id}`).replyOnce(200, { data: comments[1] }, httpHeaders);
    const subject = new Person(person);
    const result = await subject.comments();
    expect(result).toMatchSnapshot();
  });

  test('should throw if attribute is invalid', () => {
    expect(() => define('articles', class Article {
      static attributes = {
        comments: {
          invalid: 'attribute',
        }
      }
    })).toThrow('comments needs an attribute type');
  });
});

describe('Model', () => {
  bind(mockStore);

  describe('#id', () => {
    test('gets the ID from the JSON data', () => {
      const Article = define('', class Article {});
      const subject = new Article({ id: '5' });
      expect(subject.id).toEqual('5');
    });
  });

  describe('#type', () => {
    test('gets the static type', () => {
      const Article = define('bazinga', class Article {});
      expect(new Article().type).toEqual('bazinga');
    });
  });

  describe('endpoints', () => {
    test('default to RESTful endpoints', () => {
      const Article = define('articles', class Article {});
      const subject = new Article({ id: 5 });

      expect(subject.endpoint('create')).toEqual('articles');
      expect(subject.endpoint('read')).toEqual('articles');
      expect(subject.endpoint('update')).toEqual('articles/5');
      expect(subject.endpoint('delete')).toEqual('articles/5');
    });

    test('has overrideable defaults', () => {
      const Article = define('articles', class Article {
        static type = 'articles';
        static attributes = {
          slug: Attr.string()
        };
        static endpoints = {
          create: 'foo/:type',
          read: 'bar/:type',
          update: ':slug/:id',
          delete: ':id/:slug',
        };
      });
      const subject = new Article({ id: 5, attributes: { slug: 'nope-nope-nope' } });

      expect(subject.endpoint('create')).toEqual('foo/articles');
      expect(subject.endpoint('read')).toEqual('bar/articles');
      expect(subject.endpoint('update')).toEqual('nope-nope-nope/5');
      expect(subject.endpoint('delete')).toEqual('5/nope-nope-nope');
    });
  });
});
