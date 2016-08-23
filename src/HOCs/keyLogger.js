import { Component } from 'react';
import createEagerFactory from 'recompose/createEagerFactory';
import createHelper from 'recompose/createHelper';

const keyLogger = (
  eventMap
) =>
  (BaseComponent) => {
    const factory = createEagerFactory(BaseComponent);

    return class extends Component {
      componentDidMount() {
        window.addEventListener('keydown', this.handleKeyPress);
      }

      componentWillUnmount() {
        window.removeEventListener('keydown', this.handleKeyPress);
      }

      handleKeyPress = (e) => {
        const event = window.event ? window.event : e;

        if (event.target instanceof HTMLInputElement || event.target.type === 'textarea') {
          return;
        }

        eventMap(this.props)(event);
      }

      render() {
        return factory({ ...this.props });
      }
    };
  };

export default createHelper(keyLogger, 'keyLogger');
