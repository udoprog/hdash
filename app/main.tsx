import './less/main.less';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { AppContainer } from 'react-hot-loader';

import App from './components/App';

const root = document.getElementById('app');

const render = (Component: any) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    root
  );
};

render(App);
