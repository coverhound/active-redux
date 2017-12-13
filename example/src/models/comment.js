import { define, Attr } from 'active-redux';

export default define('comments', class Comment {
  static attributes = {
    op: Attr.hasOne('people'),
    body: Attr.string(),
  }
});
