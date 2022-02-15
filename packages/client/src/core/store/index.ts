import { RouterAction } from 'connected-react-router';

import createRootReducer from './rootReducer';
import { AuthServiceAction } from 'core/services/auth';
import { AuthAction } from 'core/services/auth/ducks';
import { PresentationServiceAction } from 'core/services/kgm/presentation.service';
import { ProcessServiceAction } from 'core/services/kgm/process/process.service';
import { RoleServiceAction } from 'core/services/kgm/role.service';
import { KgmServiceAction } from 'core/services/kgm/kgm.service';
import { CacheServiceAction } from 'core/services/kgm/kgm.cache.service';

export { store } from './configureStore';
export { default as StorePersistGate } from './StorePersistGate';

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

type RootAction = RouterAction | AuthServiceAction | AuthAction | RoleServiceAction | PresentationServiceAction | ProcessServiceAction | CacheServiceAction | KgmServiceAction;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}
