import { Model, Registry } from '../../dist';

export default class User extends Model {
  static type = 'users';
}

Registry.register(User);
