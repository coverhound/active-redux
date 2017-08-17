import React from 'react';
import { connect } from 'react-redux';

/**
 * Map async actions to props
 * @alias module:active-redux.connect
 * @example
 * import { connect } from 'active-redux';
 * import Article from '../models/article';
 *
 * const List = ({ isLoading, articles }) => {
 *   if (isLoading) return (
 *     <div>Loading...</div>
 *   );
 *
 *   return (
 *     <ul>
 *       {articles.map((article) => (
 *         <li><a href={article.link}>{article.title}</li>
 *       ))}
 *     </ul>
 *   );
 * };
 *
 * export default connect({
 *   articles: (props) => Article.all()
 * })(List);
 * @param {Object.<String, Function>} promises
 * @param {Object} options
 * @param {Number} options.delay Delay in Milliseconds. The component will be empty during this
 *   time. This is in place because people perceive a waiting time as longer when there is
 *   immediately a loading screen
 * @param {Number} options.timeout Timeout in Milliseconds.
 * @return {Function} Function that takes a component
 */
export default (
  promises = {},
  {
    delay = 150,
    timeout,
  } = {},
) => (WrappedComponent) => connect(
  ({ api: { resources } }) => ({ resources })
)(
  class PromisedComponent extends React.Component {
    static WrappedComponent = WrappedComponent;
    static displayName = `Promised(${WrappedComponent.displayName || WrappedComponent.name})`;
    static propTypes = WrappedComponent.propTypes;

    constructor(props) {
      super(props);

      this.state = {
        isLoading: true,
        hasTimedOut: false,
        hasDelayed: false,
        responses: {},
        error: {},
      };
    }

    componentWillMount() {
      if (!this.state.isLoading) return;
      this._isMounted = true;
      this._setupDelay();
      this._setupTimeout();
      this._startPromises(this.props);
    }

    componentWillUnmount() {
      this._isMounted = false;
      clearTimeout(this._delay);
      clearTimeout(this._timeout);
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.resources !== nextProps.resources) {
        this.setState({ isLoading: true });
        this._startPromises(nextProps);
      }
    }

    _update({ key, data, err }) {
      if (!this._isMounted || this.hasTimedOut) return;

      const responses = Object.assign({}, this.state.responses, { [key]: data });
      const error = Object.assign({}, this.state.error, { [key]: err });

      this.setState({ responses, error });
    }

    _startPromises(props) {
      Promise.all(Object.entries(promises)
        .map(([key, promise]) => promise(props)
          .then((data) => this._update({ key, data }))
          .catch((err) => this._update({ key, err }))
        )
      ).then(() => this.setState({ isLoading: false }));
    }

    _setupDelay() {
      if (delay) {
        this._delay = setTimeout(() => {
          this.setState({ hasDelayed: true });
        }, delay);
      }
    }

    _setupTimeout() {
      if (timeout) {
        this._timeout = setTimeout(() => {
          this.setState({ hasTimedOut: true });
        }, timeout);
      }
    }

    render() {
      const { responses, ...restState } = this.state;
      const { resources, ...restProps } = this.props;
      return (
        <WrappedComponent
          {...restState}
          {...responses}
          {...restProps}
        />
      );
    }
  }
);
