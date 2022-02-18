import React, { ReactNode } from 'react';
import { connect } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import history from '../History';

import { persistor } from './ConfigureStore';
import { RootState } from '.';
import { selectIsLoggedIn } from 'core/services/auth';
import LoadingScreen from 'components/LoadingScreen/LoadingScreen';
import { AUTH_ROUTER_PATHS } from 'core/Constants';

const mapStateToProps = (state: RootState) => ({
  isLoggedIn: selectIsLoggedIn(state),
});

const mapDispatchToProps = {
};;

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps & {
    children: ReactNode;
  };

const StorePersistGate = ({ children, isLoggedIn }: Props) => (
  <PersistGate
    loading={<LoadingScreen />}
    onBeforeLift={() => {
      if (isLoggedIn && history.location.pathname !== AUTH_ROUTER_PATHS.logout) {
      }
    }}
    persistor={persistor}
  >
    {children}
  </PersistGate>
);

export default connect(mapStateToProps, mapDispatchToProps)(StorePersistGate);
