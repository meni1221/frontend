import '@mantine/core/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app';
import './styles/index.css';
import { appLogger, registerGlobalLogHandlers } from './utils/logger';

registerGlobalLogHandlers();
appLogger.info('app.bootstrap', 'Frontend app mounted');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
