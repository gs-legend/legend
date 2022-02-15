import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { isActionOf } from 'typesafe-actions';

import { RootState } from '.';
import { authServiceReducer, logoutAction } from 'core/services/auth';
import { presentationServiceReducer } from 'core/services/kgm/presentation.service';
import { processServiceReducer } from 'core/services/kgm/process/process.service';
import { CacheServiceReducer } from 'core/services/kgm/kgm.cache.service';
import { kgmServiceReducer } from 'core/services/kgm/kgm.service';
import { roleServiceReducer } from 'core/services/kgm/role.service';

export default function createRootReducer(history: History): typeof rootReducer {
  const rootReducer = combineReducers({
    authService: authServiceReducer,
    presentationService: presentationServiceReducer,
    processService: processServiceReducer,
    cacheService: CacheServiceReducer,
    kgmService: kgmServiceReducer,
    role: roleServiceReducer,
    router: connectRouter(history),
  });

  return (state, action) =>
    isActionOf(logoutAction, action)
      ? rootReducer(state ? ({ router: state.router } as RootState) : undefined, action)
      : rootReducer(state, action);
}
