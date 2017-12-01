import React from 'react';
import { connect } from 'react-redux';

import { Comment } from '../../models';

class View extends React.Component {
  constructor() {
    super();
    this.state = { fetched: false };
  }

  componentWillMount() {
    if (this.comment.op || this.state.fetched) return;

    this.setState({ fetched: true }, () => {
      this.comment.fetchOp();
    });
  }

  get comment() {
    return this.props.comment;
  }

  render() {
    const op = this.comment.op || {};
    return (
      <span>
        <dt>{op.name}</dt>
        <dd>{this.comment.body}</dd>
      </span>
    );
  }
}

// see https://github.com/reactjs/reselect#sharing-selectors-with-props-across-multiple-component-instances
const mapStateToProps = () => {
  const commentQuery = Comment.selectQuery;
  return (state, props) => ({
    comments: commentQuery('', { endpoint: `articles/${props.articleId}/comments` })(state)
  });
};

const List = ({ comments }) => (
  comments.length > 0 ? (
    <dl>
      <h5>Comments</h5>
      {comments.map((comment) => <View key={comment.body} comment={comment} />)}
    </dl>
  ) : <p>No comments found</p>
);

export default connect(mapStateToProps, () => ({}))(List);
