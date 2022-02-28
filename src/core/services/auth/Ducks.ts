import { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { push } from 'connected-react-router';
import { createAction, ActionType } from 'typesafe-actions';

import { rootPath } from 'core/Config';
import {
  ForgottenPasswordPayload,
  AuthResponse,
  GetDomainResponse,
  GetLogoResponse
} from 'core/services/ApiTypes';
import { loginActions, domainActions, logoActions, logoutAction } from 'core/services/auth';

import api from '../Api';

/**
 * ACTIONS
 */
export const forgottenPasswordAction = createAction('auth/FORGOTTEN_PASSWORD')<
  ForgottenPasswordPayload
>();

const actions = {
  forgottenPasswordAction
};
export type AuthAction = ActionType<typeof actions>;

/**
 * SAGAS
 */
function* login({ payload }: ReturnType<typeof loginActions.request>) {
  try {
    const resp: AxiosResponse<AuthResponse> = yield call(api.login, payload);
    yield put(loginActions.success(resp.data));
  } catch {
    yield put(loginActions.failure({}));
  }
}

function* logout() {
  try {
    const resp = yield call(api.logout);
    yield put(logoActions.success(resp.data));
  } catch {
  }
}

function* forgottenPassword({ payload }: ReturnType<typeof forgottenPasswordAction>) {
  try {
    yield call(api.forgottenPassword, payload);
    yield put(push(rootPath));
  } catch { }
}

function* getDomain() {
  try {
    const resp: AxiosResponse<GetDomainResponse> = yield call(api.getDomain);
    yield put(logoActions.request({}));
    yield put(domainActions.success(resp.data));
  } catch {
    yield put(domainActions.failure({}));
  }
}

function* getLogo() {
  try {
    const resp: AxiosResponse<GetLogoResponse> = yield call(api.getLogo);
    yield put(logoActions.success(resp.data));
  } catch {
    yield put(logoActions.failure({}));
  }
}

export function* authSaga() {
  yield takeLatest(loginActions.request, login);
  yield takeLatest(logoutAction, logout);
  yield takeLatest(forgottenPasswordAction, forgottenPassword);
  yield takeLatest(domainActions.request, getDomain);
  yield takeLatest(logoActions.request, getLogo);
}
