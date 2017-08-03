import { Model, Registry } from '../../dist';

export default class Comment extends Model {
  static type = 'comments';
}

Registry.register(Comment);
