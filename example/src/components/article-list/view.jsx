import React, { Component } from 'react';
import Comments from './comments';
import { Person } from '../../models';

const Author = ({ author = {} }) => {
  const onClick = () => Person.find(author.id);

  const occupation = author.occupation ?
    <small>Occupation: {author.occupation}</small> :
    <button onClick={onClick}>+</button>;

  return (
    <h6 className="author">By: {author.name} {occupation}</h6>
  );
};

export default class ArticleView extends Component {
  constructor() {
    super();
    this.state = { showComments: false };
  }

  onClick = () => {
    this.setState({ showComments: true });
  };

  showComments() {
    if (this.state.showComments) {
      return <Comments articleId={this.props.article.id} />;
    }

    return (
      <button onClick={this.onClick}>Show comments</button>
    );
  }

  render() {
    return (
      <li>
        <h3>{this.props.article.title}</h3>
        <Author author={this.props.article.author} />
        {this.showComments()}
      </li>
    );
  }
}
