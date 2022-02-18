import { AxiosResponse } from 'axios';
import { call, put, takeLatest, all } from 'redux-saga/effects';

import {
    GetUserResponse
} from 'core/services/ApiTypes';
import { getUserActions } from './RoleService';
import { DashboardResponse } from 'core/types/Dashboard';
import { getDashboardActions, getThemeActions } from './PresentationService';
import { getAppAndUserContextActions } from './CacheService';
import { AppAndUserContext } from 'core/types/AppAndUserContext';
import api from '../Api';
import { logoutAction } from '../auth';
import { callProcessActions, selectProcessState, setSplitAction, selectSplitPane, setCurrentPaneKeyAction, removeProcessAction, callStaticProcessActions, generateGUID, callProcessDataActions } from './ProcessService';
import { store } from 'core/store';
import _ from 'lodash';
import { getOnLoadActions } from './KgmService';



function* getUser() {
    try {
        const resp: AxiosResponse<GetUserResponse> = yield call(api.getUser);
        yield put(getUserActions.success(resp.data));
    } catch {
        yield put(getUserActions.failure());
    }
}

function* getDashboard() {
    try {
        const resp: AxiosResponse<DashboardResponse> = yield call(api.getDashboard);
        yield put(getDashboardActions.success(resp.data));
    } catch {
        yield put(getDashboardActions.failure());
    }
}

function* getAppAndUserContext() {
    try {
        const resp: AxiosResponse<AppAndUserContext> = yield call(api.getAppAndUserContext);
        yield put(getAppAndUserContextActions.success(resp.data));
    } catch {
        yield put(getAppAndUserContextActions.failure());
    }
}

function* getOnLoadState() {
    try {
        const { appAndUserContext, dashboard } = yield all({
            appAndUserContext: call(api.getAppAndUserContext),
            dashboard: call(api.getDashboard)
        });
        yield put(getOnLoadActions.success({ appAndUserContext, dashboard }));
        if (!appAndUserContext || !dashboard) {
            yield put(logoutAction());
        }
        else {
            yield put(getAppAndUserContextActions.success(appAndUserContext.data));
            yield put(getDashboardActions.success(dashboard.data));
        }
    } catch {
        yield put(getOnLoadActions.failure());
    }
}


function* getStaticProcess({ payload }: any) {
    try {
        const state = store.getState();
        const processes: Array<any> = yield selectProcessState(state);
        const { processName, callBack } = payload;
        const existing = _.find(processes, { tabName: processName });
        const panes = yield selectSplitPane(state);
        const { FirstPane, SecondPane }: any = Object.assign({}, panes);

        if (existing) {
            const firstIndex = _.findIndex(FirstPane.tabs, { tabName: processName });
            const secondIndex = _.findIndex(SecondPane.tabs, { tabName: processName });
            let newFirstPane = { ...FirstPane };
            let newSecondPane = { ...SecondPane };
            if (secondIndex > -1) {
                newSecondPane = { ...newSecondPane, currentTab: processName };
            }
            if (firstIndex > -1) {
                newFirstPane = { ...newFirstPane, currentTab: processName };
            }
            yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane: newSecondPane }));
        }
        else {
            const GUID = generateGUID();
            const newProcessState = [...processes, { GUID: GUID, tabName: processName }];
            yield put(callProcessActions.success(newProcessState));
            let newFirstPane = { ...FirstPane };
            let { tabs } = newFirstPane || [];
            tabs = [...tabs, { GUID: GUID, tabName: processName }];
            newFirstPane = { ...newFirstPane, tabs: tabs, currentTab: processName };
            yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane }));
            if (callBack) {
                yield put(callBack());
            }
        }
    } catch (ex) {
        console.log(ex)
    }
}

function* getProcess({ payload }: ReturnType<typeof callProcessActions.request>) {
    try {
        const processes = yield selectProcessState(store.getState());
        const { request, isUserTriggered, callBack } = payload;
        const processName = _.get(request, 'event.processName');
        const existing = processes[processName];
        const panes = yield selectSplitPane(store.getState());
        const { FirstPane, SecondPane }: any = Object.assign({}, panes);

        if (existing && isUserTriggered) {
            const firstIndex = _.findIndex(FirstPane.tabs, { tabName: processName });
            const secondIndex = _.findIndex(SecondPane.tabs, { tabName: processName });
            let newFirstPane = { ...FirstPane };
            let newSecondPane = { ...SecondPane };
            if (secondIndex > -1) {
                newSecondPane = { ...newSecondPane, currentTab: processName }
            }
            if (firstIndex > -1) {
                newFirstPane = { ...newFirstPane, currentTab: processName }
            }
            yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane: newSecondPane }));
        }
        else {
            const resp = yield call(api.process, request);
            if (isUserTriggered) {
                const newProcessState = [...processes, { GUID: payload.guid, tabName: processName, [processName]: resp.data }];
                yield put(callProcessActions.success(newProcessState));
                let newFirstPane = { ...FirstPane };
                let { tabs } = newFirstPane || [];
                tabs = [...tabs, { GUID: payload.guid, tabName: processName }];
                newFirstPane = { ...newFirstPane, tabs: tabs, currentTab: processName };
                yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane }));
            }
            else if (callBack) {
                yield put(callBack(resp));
            }
        }
    } catch {
    }
}


function* setSplitTab({ payload }: ReturnType<typeof setSplitAction.request>) {
    try {
        const { processKey, action } = payload;
        const panes = selectSplitPane(store.getState());
        const { FirstPane, SecondPane }: any = Object.assign({}, panes);
        const firstIndex = _.findIndex(FirstPane.tabs, { tabName: processKey });
        const secondIndex = _.findIndex(SecondPane.tabs, { tabName: processKey });
        let newFirstPane = { ...FirstPane };
        let newSecondPane = { ...SecondPane };

        if (secondIndex === -1 && action === "add") {
            if (firstIndex > -1) {
                newSecondPane = { ...SecondPane, tabs: [...SecondPane.tabs, FirstPane[firstIndex]], currentTab: processKey };
                newFirstPane = {
                    ...FirstPane,
                    tabs: [...FirstPane.tabs.slice(0, firstIndex),
                    ...FirstPane.tabs.slice(firstIndex + 1)],
                    currentTab: firstIndex > 0 ? FirstPane.tabs[firstIndex - 1] : FirstPane.tabs[0]
                };
            }
        }
        if (secondIndex > -1 && action === "remove") {
            newSecondPane = {
                ...SecondPane,
                tabs: [...SecondPane.tabs.slice(0, secondIndex),
                ...SecondPane.tabs.slice(secondIndex + 1)],
                currentTab: secondIndex > 0 ? SecondPane.tabs[secondIndex - 1] : SecondPane.tabs[0]
            };
            newFirstPane = { ...FirstPane, tabs: [...FirstPane.tabs, ...SecondPane.tabs[secondIndex]] };

        }
        yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane: newSecondPane }));
    } catch (ex) {
        console.log(ex);
    }
}

function* setCurrentPaneKey({ payload }: ReturnType<typeof setCurrentPaneKeyAction>) {
    try {
        const { processKey, paneNumber } = payload;
        const panes: any = selectSplitPane(store.getState());
        const { FirstPane, SecondPane } = panes;
        let newFirstPane = { ...FirstPane };
        let newSecondPane = { ...SecondPane };
        if (paneNumber === 1) {
            newFirstPane = { ...FirstPane, currentTab: processKey };
        }
        if (paneNumber === 2) {
            newSecondPane = { ...SecondPane, currentTab: processKey };
        }

        yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane: newSecondPane }));
    } catch (ex) {
        console.log(ex);
    }
}

function* removeProcess({ payload }: ReturnType<typeof removeProcessAction>) {
    try {
        const { processKey } = payload;

        const panes: any = selectSplitPane(store.getState());
        const processes = yield selectProcessState(store.getState());

        const { FirstPane, SecondPane } = panes;
        const firstIndex = _.findIndex(FirstPane.tabs, { tabName: processKey });
        const secondIndex = _.findIndex(SecondPane.tabs, { tabName: processKey });
        let newFirstPane = { ...FirstPane };
        let newSecondPane = { ...SecondPane };

        const newProcess = _.filter(processes, process => {
            return process.tabName !== processKey;
        });

        yield put(callProcessActions.success(newProcess));

        if (firstIndex !== -1) {
            newFirstPane = {
                ...FirstPane,
                tabs: [...FirstPane.tabs.slice(0, firstIndex),
                ...FirstPane.tabs.slice(firstIndex + 1)],
                currentTab: FirstPane.currentTab === processKey ? FirstPane.tabs[0] : FirstPane.currentTab
            };
        }

        if (secondIndex !== -1) {
            newSecondPane = {
                ...SecondPane,
                tabs: [...SecondPane.tabs.slice(0, secondIndex),
                ...SecondPane.tabs.slice(secondIndex + 1)],
                currentTab: SecondPane.currentTab === processKey ? SecondPane.tabs[0] : SecondPane.currentTab
            };
        }

        yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane: newSecondPane }));
    } catch (ex) {
        console.log(ex);
    }
}

function* setTheme({ payload }: ReturnType<typeof getThemeActions.request>) {
    const { theme } = payload;
    yield put(getThemeActions.success(theme))
}


function* getProcessData({ payload }: ReturnType<typeof callProcessDataActions.request>) {
    try {
        const processes = yield selectProcessState(store.getState());
        const processName = payload;
        const resp = yield call(api.processData, processName);
        const newProcess = { ...processes };
        const process = { ...newProcess[processName], data: resp.data };
        // process.data = [resp.data];
        const newProcessState = { ...newProcess, [processName]: process }
        yield put(callProcessActions.success(newProcessState));
    } catch (ex) {
        console.log(ex);
    }
}

export function* kgmSaga() {
    yield takeLatest(getUserActions.request, getUser);
    yield takeLatest(getDashboardActions.request, getDashboard);
    yield takeLatest(getThemeActions.request, setTheme);
    yield takeLatest(getAppAndUserContextActions.request, getAppAndUserContext);
    yield takeLatest(callStaticProcessActions.request, getStaticProcess);
    yield takeLatest(getOnLoadActions.request, getOnLoadState);
    yield takeLatest(callProcessActions.request, getProcess);
    yield takeLatest(setSplitAction.request, setSplitTab);
    yield takeLatest(setCurrentPaneKeyAction, setCurrentPaneKey);
    yield takeLatest(removeProcessAction, removeProcess);
    yield takeLatest(callProcessDataActions.request, getProcessData);
}