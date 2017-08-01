import { Model, Registry } from '../../dist';

export default class Article extends Model {
  static type = 'articles';
}

Registry.register(Article);
