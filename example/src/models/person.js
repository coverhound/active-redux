import { define, Attr } from 'active-redux';

export default define('people', class Person {
  static attributes = {
    posts: Attr.hasMany('articles'),
    comments: Attr.hasMany('comments'),
    name: Attr.string(),
    occupation: Attr.string(),
  }
});
