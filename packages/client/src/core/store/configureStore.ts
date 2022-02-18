import { applyMiddleware, createStore } from 'redux';
import { createMigrate, persistReducer, persistStore, MigrationManifest } from 'redux-persist';
import localForage from 'localforage';
import createSagaMiddleware from 'redux-saga';
import { routerMiddleware } from 'connected-react-router';
import { composeWithDevTools } from '@redux-devtools/extension';

import { isDev } from 'core/Config';

import history from '../History';

import createRootReducer from './RootReducer';
import rootSaga from './RootSaga';

const sagaMiddleware = createSagaMiddleware();

const migrations: MigrationManifest = {
  // Add redux migrations here
};

const persistedReducer = persistReducer(
  {
    key: 'root',
    version: 0,
    storage: localForage,
    whitelist: ['authService', 'processService', 'roleService', 'settingsService','kgmService','cacheService','presentationService','settingsService'],
    debug: isDev,
    migrate: createMigrate(migrations, { debug: isDev }),
  },
  createRootReducer(history)
);

const middlewares = [sagaMiddleware, routerMiddleware(history)];

if (isDev) {
  const { createLogger } = require('redux-logger');
  const ImmutableStateInvariant = require('redux-immutable-state-invariant').default;

  middlewares.push(createLogger(), ImmutableStateInvariant());
}

const store = createStore(persistedReducer, {}, composeWithDevTools(applyMiddleware(...middlewares)));

const persistor = persistStore(store);

sagaMiddleware.run(rootSaga);

export { store, persistor };
