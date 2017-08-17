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
        errored: {},
      };

      this.promiseCount = Object.keys(promises).length;
      this.loadedCount = 0;
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
        this._startPromises(nextProps);
      }
    }

    _startPromises(props) {
      const update = ({ key, data, error = false }) => {
        if (!this._isMounted || this.hasTimedOut) return;

        this.loadedCount += 1;
        this.setState({
          responses: {
            ...this.state.responses,
            [key]: data
          },
          errored: {
            ...this.state.errored,
            [key]: error
          },
          isLoading: this.promiseCount > this.loadedCount,
        });
      };

      Object.entries(promises)
        .forEach(([key, promise]) => promise(props)
          .then((data) => update({ key, data }))
          .catch((data) => update({ key, data, error: true }))
      );
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
      const { responses, ...props } = this.state;
      const { resources, ...theseProps } = this.props;
      return (
        <WrappedComponent
          {...props}
          {...responses}
          {...theseProps}
        />
      );
    }
  }
);
