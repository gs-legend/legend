import './Wdyr';
import 'react-hot-loader';
import { hot } from 'react-hot-loader/root';
import Root from 'containers/Root';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import "reflect-metadata";
import "assets/styles/global.less";

const HotApp = hot(Root);

ReactDOM.render(
  <HotApp />,
  document.getElementById('root')
);

reportWebVitals();
