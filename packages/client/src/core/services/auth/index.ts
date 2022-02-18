import { combineReducers } from 'redux';
import { createSelector } from 'reselect';
import { ActionType, createAction, createAsyncAction, createReducer } from 'typesafe-actions';

import { RootState } from 'core/store';
import { User, Token, LoginPayload, AuthResponse, GetDomainResponse, GetLogoResponse } from 'core/services/ApiTypes';
import { generateGUID } from '../kgm/ProcessService';

/**
 * ACTIONS
 */
export const loginActions = createAsyncAction(
  'authService/LOGIN_REQUEST',
  'authService/LOGIN_SUCCESS',
  'authService/LOGIN_FAILURE'
)<LoginPayload, AuthResponse, any>();
export const logoutAction = createAction('authService/LOGOUT')();
export const domainActions = createAsyncAction(
  'authService/GET_DOMAIN',
  'authService/GET_DOMAIN_SUCCESS',
  'authService/GET_DOMAIN_FAILURE'
)<{}, GetDomainResponse, any>();
export const logoActions = createAsyncAction(
  'authService/GET_LOGO',
  'authService/GET_LOGO_SUCCESS',
  'authService/GET_LOGO_FAILURE'
)<{}, GetLogoResponse, any>();

const actions = { loginActions, logoutAction, domainActions, logoActions };
export type AuthServiceAction = ActionType<typeof actions>;

/**
 * REDUCERS
 */
type AuthServiceState = Readonly<{
  user: User;
  token: Token;
  isAuthenticating: boolean;
  domain: string;
  logo: string;
  windowId: string;
}>;

const initialState: AuthServiceState = {
  isAuthenticating: false,
  user: null as any,
  token: null as any,
  domain: null as any,
  logo: null as any,
  windowId: generateGUID()
};

const isAuthenticating = createReducer(initialState.isAuthenticating)
  .handleAction([loginActions.request], () => true)
  .handleAction([loginActions.success, loginActions.failure], () => false);

const user = createReducer(initialState.user)
  .handleAction(loginActions.success, (_, { payload: { username } }) => username)
  .handleAction(loginActions.failure, () => null as any);

const token = createReducer(initialState.token)
  .handleAction(loginActions.success, (_, { payload: { token } }) => token)
  .handleAction(loginActions.failure, () => initialState.token);

const domain = createReducer(initialState.domain)
  .handleAction(domainActions.success, (_, { payload: { domain } }) => domain || initialState.domain)
  .handleAction(domainActions.failure, () => initialState.domain);

const logo = createReducer(initialState.logo)
  .handleAction(logoActions.success, (_, { payload: { logodata } }) => logodata || initialState.logo)
  .handleAction(logoActions.failure, () => initialState.logo);

const logout = createReducer(initialState.token)
  .handleAction(logoutAction, () => "");

const windowId = createReducer(initialState.windowId)
  .handleAction(loginActions.success, () => initialState.windowId)
  .handleAction(loginActions.failure, () => initialState.windowId);

export const authServiceReducer = combineReducers({
  isAuthenticating,
  user,
  token,
  domain,
  logo,
  logout,
  windowId
});

/**
 * SELECTORS
 */
export const selectAuthServiceState = (state: RootState) => state.authService;
export const selectIsAuthenticating = (state: RootState) => selectAuthServiceState(state).isAuthenticating;
export const selectUser = (state: RootState) => selectAuthServiceState(state).user;
export const selectToken = (state: RootState) => selectAuthServiceState(state).token;
export const selectDomain = (state: RootState) => selectAuthServiceState(state).domain;
export const selectLogo = (state: RootState) => selectAuthServiceState(state).logo;
export const selectWindowId = (state: RootState) => selectAuthServiceState(state).windowId;

export const selectIsLoggedIn = createSelector(selectToken, (token) => !!token);
