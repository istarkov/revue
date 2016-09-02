// withStateSelector idea https://github.com/acdlite/recompose/issues/199
import { Component } from 'react';
import createEagerFactory from 'recompose/createEagerFactory';
import createHelper from 'recompose/createHelper';

const withStateSelector = (stateName, stateUpdaterName, selectorFactory) =>
  BaseComponent => {
    const factory = createEagerFactory(BaseComponent);
    return class extends Component {
      selector = selectorFactory();
      initialValue = this.selector(this.props);
      state = {
        selectorValue: this.initialValue,
        stateValue: this.initialValue,
      };

      updateStateValue = (updateFn, callback) => (
        this.setState(({ stateValue }) => ({
          stateValue: typeof updateFn === 'function'
            ? updateFn(stateValue)
            : updateFn,
        }), callback)
      );

      componentWillReceiveProps(nextProps) {
        // reselect memoize result
        const nextStateValue = this.selector(nextProps);
        if (nextStateValue !== this.state.selectorValue) {
          this.setState({
            selectorValue: nextStateValue,
            stateValue: nextStateValue,
          });
        }
      }

      render() {
        return factory({
          ...this.props,
          [stateName]: this.state.stateValue,
          [stateUpdaterName]: this.updateStateValue,
        });
      }
    };
  };

export default createHelper(withStateSelector, 'withStateSelector');
