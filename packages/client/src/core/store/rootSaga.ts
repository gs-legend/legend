import { all, fork } from 'redux-saga/effects';
import { authSaga } from 'core/services/auth/Ducks';
import { kgmSaga } from 'core/services/kgm/KgmSaga';

export default function* rootSaga() {
  yield all([fork(authSaga), fork(kgmSaga)]);
}
