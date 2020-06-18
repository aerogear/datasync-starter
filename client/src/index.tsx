import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './App';
import { AppContainer } from './AppContainer';
import * as serviceWorker from './serviceWorker';
import { configure } from "offix-datastore";

configure([
    { __typename: "Task" }
]);
ReactDOM.render(<AppContainer app={App} />, document.getElementById('root'));

serviceWorker.register();
