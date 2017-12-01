import * as AR from 'active-redux';

export default AR.define('articles', class Article {
  static attributes = {
    author: AR.Attr.hasOne('people'),
    comments: AR.Attr.hasMany('comments'),
    title: AR.Attr.string(),
  };
});
