import { all, fork } from 'redux-saga/effects';
import { authSaga } from 'core/services/auth/ducks';
import { kgmSaga } from 'core/services/kgm/kgm.saga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(kgmSaga)]);
}
