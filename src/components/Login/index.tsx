import React from 'react';
import { connect } from 'react-redux';

import Login from './view';
import { loginActions } from 'core/services/auth';
import { apiCallIds } from 'core/services/Api';
import { useTrackProgress } from 'core/services/TrackProgress';

const mapDispatchToProps = {
  login: loginActions.request
};

type Props = typeof mapDispatchToProps;


const LoginContainer = ({ login }: Props) => {
  const isInProgress = useTrackProgress(apiCallIds.LOGIN);
  return <Login isLoading={isInProgress} onSubmit={login} />;
};

export default connect(null, mapDispatchToProps)(LoginContainer);
