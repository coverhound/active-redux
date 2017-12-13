import React from 'react';
import { connect } from 'react-redux';

import { Article } from '../../models';
import View from './view';

// see https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const mapStateToProps = () => {
  const articleFindAll = Article.selectAll;
  return (state, props) => ({
    articles: articleFindAll()(state)
  });
};

const List = ({ articles }) => (
  articles.length > 0 ? (
    <ul>
      {articles.map((article) => <View key={article.title} article={article} />
      )}
    </ul>
  ) : <p>Loading...</p>
);

export default connect(mapStateToProps, () => ({}))(List);
