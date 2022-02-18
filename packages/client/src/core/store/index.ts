import { RouterAction } from 'connected-react-router';

import createRootReducer from './RootReducer';
import { AuthServiceAction } from 'core/services/auth';
import { PresentationServiceAction } from 'core/services/kgm/PresentationService';
import { RoleServiceAction } from 'core/services/kgm/RoleService';
import { CacheServiceAction } from 'core/services/kgm/CacheService';
import { AuthAction } from 'core/services/auth/Ducks';
import { ProcessServiceAction } from 'core/services/kgm/ProcessService';
import { KgmServiceAction } from 'core/services/kgm/KgmService';

export { store } from './ConfigureStore';
export { default as StorePersistGate } from './StorePersistGate';

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

type RootAction = RouterAction | AuthServiceAction | AuthAction | RoleServiceAction | PresentationServiceAction | ProcessServiceAction | CacheServiceAction | KgmServiceAction;

declare module 'typesafe-actions' {
  interface Types {
    RootAction: RootAction;
  }
}
