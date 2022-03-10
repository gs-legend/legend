import './Wdyr';
import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import Root from 'containers/Root';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import "assets/styles/global.less";
import React from 'react';

// const HotApp = hot(Root);

ReactDOM.render(
  <React.Fragment>
    <Root />
  </React.Fragment>,
  document.getElementById('root')
);

reportWebVitals();
