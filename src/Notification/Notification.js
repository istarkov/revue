import React from 'react';
import compose from 'recompose/compose';
import { themr } from 'react-css-themr';
import notificationStyles from './notification.sass';

export const notification = ({
  theme,
  title,
  buttonText = 'Close',
  onButtonClick = () => {},
  list,
}) => (
  <div className={theme.main}>
    <div className={theme.notification}>
      <div className={theme.title}>
        {title}
      </div>
      <div className={theme.list}>
        {
          list.map((text, index) => (
            <div key={index} className={theme.item}>{text}</div>
          ))
        }
      </div>
      <button
        onClick={onButtonClick}
        className={theme.close}
      >
        {buttonText}
      </button>
    </div>
  </div>
);

export const notificationHOC = compose(
  themr('notification', notificationStyles)
);

export default notificationHOC(notification);
