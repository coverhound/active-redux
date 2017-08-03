import { Attr, Model, Registry } from '../src';
import jsonApiData from 'fixtures/json-api-body';
import mockStore from 'fixtures/store';

const article = jsonApiData.data[0];
const [person, ...comments] = jsonApiData.included;

describe('Model', () => {
  const apiState = mockStore.getState().api;

  beforeEach(() => {
    Model.store = mockStore;
  });

  describe('.__defineMethods__()', () => {
    test('defines attribute methods', () => {
      class Article extends Model {
        static attributes = {
          title: Attr.string()
        };
      }
      expect(new Article(article).title).toEqual(undefined);
      Registry.register(Article);
      expect(new Article(article).title).toEqual(article.attributes.title);
    });

    test('defines hasOne methods', async () => {
      class Comment extends Model {
        static type = 'comments';
        static attributes = {
          author: Attr.hasOne(),
        };
      }

      expect(new Comment(comments[0]).author).toBeUndefined();

      Registry.register(Comment);

      const comment = new Comment(comments[0]);
      expect(await comment.author).toMatchSnapshot();
    });

    test('defines hasMany methods', async () => {
      class Person extends Model {
        static type = 'people';
        static attributes = {
          comments: Attr.hasMany(),
        }
      }

      expect(new Person(person).comments).toBeUndefined();
      Registry.register(Person);
      const subject = new Person(person);
      expect(await subject.comments).toMatchSnapshot();
    });

    test('should throw if attribute is invalid', () => {
      class Article extends Model {
        static attributes = {
          comments: {
            invalid: 'attribute',
          }
        }
      }

      expect(Article.__defineMethods__.bind(Article)).toThrow('comments needs an attribute type');
    });
  });

  describe('#type', () => {
    test('gets the static type', () => {
      class Article extends Model { static type = 'articles'; }
      expect(new Article().type).toEqual('articles');
    });
  });

  describe('Store', () => {
    class Comment extends Model { static type = 'comments'; }
    Registry.register(Comment);
    class Person extends Model { static type = 'people'; }
    Registry.register(Person);
    Registry.store = mockStore;

    describe('#dispatch', () => {
      test('provides a getter for store dispatch', () => {
        expect(Model.dispatch).toBeInstanceOf(Function);
      });
    });

    describe('#all', () => {
      test('should return all values from a resource store', async () => {
        const response = await Comment.all();

        expect(response).toMatchSnapshot();
      });
    });

    describe('#findById', () => {
      test('should find an entity in store by id', async () => {
        const response = await Comment.findById(5);
        expect(response.body).toEqual(apiState.comments[5].body);
      });
    });

    describe('#where', () => {
      test('should return an array of values matching a query', async () => {
        const response = await Comment.where({ attributes: { body: 'First!' } });
        expect(response).toMatchSnapshot();
      });

      test('should allow arrays as lookup value', async () => {
        const response = await Comment.where({ id: ['5', '12'] });
        expect(response).toMatchSnapshot();
      });

      test('should search for nested properties', async () => {
        const response = await Person.where({ attributes: {
          address: { road: '123 Main St' }
        } });
        expect(response).toMatchSnapshot();
      });
    });
  });

  describe('endpoints', () => {
    test('default to RESTful endpoints', () => {
      class Article extends Model { static type = 'articles'; }
      Article.__defineMethods__();
      const subject = new Article({ id: 5 });

      expect(subject.endpoint('create')).toEqual('articles');
      expect(subject.endpoint('read')).toEqual('articles');
      expect(subject.endpoint('update')).toEqual('articles/5');
      expect(subject.endpoint('delete')).toEqual('articles/5');
    });

    test('has overrideable defaults', () => {
      class Article extends Model {
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
      }
      Article.__defineMethods__();
      const subject = new Article({ id: 5, attributes: { slug: 'nope-nope-nope' } });

      expect(subject.endpoint('create')).toEqual('foo/articles');
      expect(subject.endpoint('read')).toEqual('bar/articles');
      expect(subject.endpoint('update')).toEqual('nope-nope-nope/5');
      expect(subject.endpoint('delete')).toEqual('5/nope-nope-nope');
    });
  });
});
