import { Attr, Model } from '../src';
import jsonApiData from '../fixtures/json-api-body';
import mockStore from '../fixtures/store';

const data = jsonApiData.data[0];
const [author, ...comments] = jsonApiData.included;

describe('Model', () => {
  let apiState = mockStore.getState().api;

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
      expect(new Article(data).title).toEqual(undefined);
      Article.__defineMethods__();
      expect(new Article(data).title).toEqual(data.attributes.title);
    });

    test('defines hasOne methods', () => {
      class Article extends Model {
        static attributes = {
          author: Attr.hasOne(),
        };
      }

      expect(new Article(data).author).toBeUndefined();
      Article.__defineMethods__();
      const article = new Article(data);
      expect(article.author).toBeDefined();
      expect(typeof article.author).toEqual('object');
    });

      test('defines hasMany methods', () => {
        class Article extends Model {
          static attributes = {
            comments: Attr.hasMany(),
          }
        }

        expect(new Article(data).comments).toBeUndefined();
        Article.__defineMethods__();
        const article = new Article(data);
        expect(article.comments).toBeDefined();
        expect(article.comments).toHaveProperty('length');
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

  describe('#dispatch', () => {
    test('provides a getter for store dispatch', () => {
      expect(Model.dispatch).toBeInstanceOf(Function);
    });
  });

  describe('#findById', () => {
    test('should find an entity in store by id', () => {
      const response = Model.findById(5, 'comments');
      expect(response.body).toEqual(apiState.comments[5].body);
    });
  });

  describe('#findAll', () => {
    test('should return all values from a resource store', () => {
      const response = Model.findAll('comments');

      expect(response).toMatchSnapshot();
    });
  });

  describe('#find', () => {
    test('should return an array of values matching a query', () => {
      const response = Model.find({
        attributes: {
          body: 'First!',
        },
      }, 'comments');
      expect(response).toMatchSnapshot();
    });

    test('should allow arrays as lookup value', () => {
      const response = Model.find({
        id: ['5', '12'],
      }, 'comments');
      expect(response).toMatchSnapshot();
    });

    test('should search for nested properties', () => {
      const response = Model.find({
        attributes: {
          address: {
            road: '123 Main St'
          }
        }
      }, 'people');

      expect(response).toMatchSnapshot();
    });
  });
});
