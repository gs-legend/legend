import { SHA256 } from 'crypto-js';
import apiClient from 'core/services/apiClient';
import {
  LoginPayload,
  AuthResponse,
  ForgottenPasswordPayload,
} from 'core/services/ApiTypes';

import dataService from 'core/data.service';
import { selectDomain } from './auth';
import { store } from 'core/store';
import { trackProgress } from './trackProgress';


export const apiCallIds = {
  LOGIN: 'LOGIN',
  FORGOTTEN_PASSWORD: 'FORGOTTEN_PASSWORD',
  GET_DOMAIN: 'GET_DOMAIN',
  GET_LOGO: 'GET_LOGO'
};


const API = {
  login: (data: LoginPayload) => {
    const hash = "" + SHA256(data.password);
    const userDomain = selectDomain(store.getState());

    const newData: LoginPayload = {
      username: data.username,
      password: hash,
      authServerHost: window.location.host,
      userDomain: userDomain
    };
    return trackProgress(apiClient.post<AuthResponse>(dataService.BASE_URL + 'api/auth/login', newData));
  },

  logout: () =>
    trackProgress(apiClient.get(dataService.BASE_URL + 'api/auth/logout')),


  forgottenPassword: (data: ForgottenPasswordPayload) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'api/auth/forgotten-password', data)),

  getDomain: () =>
    trackProgress(apiClient.get(dataService.BASE_URL + 'api/auth/getDomain', { withCredentials: false })),

  getLogo: () =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'api/auth/getLogo', {}, { withCredentials: false })),

  getUser: () =>
    trackProgress(apiClient.get(dataService.BASE_URL + 'role/role/getUser', { withCredentials: true })),

  getDashboard: () =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'api/presentation/getDashboard', {}, { withCredentials: true })),

  getMenu: () =>
    trackProgress(apiClient.get(dataService.BASE_URL + 'menu')),

  getAppAndUserContext: () =>
    trackProgress(apiClient.get(dataService.BASE_URL + 'bpm/cache/getAppAndUserContext', { withCredentials: true })),

  process: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'bpm/bpm/process', data, { withCredentials: true })),

  processData: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'process/data', { processName: data }, { withCredentials: true })),

  processTrigger: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'process/trigger', data, { withCredentials: true })),

  processTriggerSubmit: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'process/submit', data, { withCredentials: true })),

  getDropdownData: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'process/fetchDropDownData', data, { withCredentials: true })),

  getPrimordial: (data: any) =>
    trackProgress(apiClient.post(dataService.BASE_URL + 'primordial/primordial', data, { withCredentials: true })),

};

export default API;