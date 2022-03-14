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
import { callProcessActions, selectProcessState, setSplitAction, selectSplitPane, setCurrentPaneKeyAction, removeProcessAction, callStaticProcessActions, callProcessDataActions, setSearchKeyAction, continueProcessAction } from './ProcessService';
import { store } from 'core/store';
import _ from 'lodash';
import { getOnLoadActions } from './KgmService';
import { generateGUID } from 'core/utils/ProcessUtils';
import ProcessHelper from 'core/helpers/ProcessHelper';
import PresentationHelper from 'core/helpers/PresentationHelper';



function* getUser() {
    try {
        const resp: AxiosResponse<GetUserResponse> = yield call(api.getUser);
        yield put(getUserActions.success(resp.data));
    } catch {
        yield put(getUserActions.failure({}, {}));
    }
}

function* getDashboard() {
    try {
        const resp: AxiosResponse<DashboardResponse> = yield call(api.getDashboard);
        yield put(getDashboardActions.success(resp.data));
    } catch {
        yield put(getDashboardActions.failure({}, {}));
    }
}

function* getAppAndUserContext() {
    try {
        const resp: AxiosResponse<AppAndUserContext> = yield call(api.getAppAndUserContext);
        yield put(getAppAndUserContextActions.success(resp.data));
    } catch {
        yield put(getAppAndUserContextActions.failure({}, {}));
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
        yield put(getOnLoadActions.failure({}, {}));
    }
}


function* getStaticProcess({ payload }: any) {
    try {
        const state = store.getState();
        const processes: Array<any> = yield selectProcessState(state);
        const { processName, callBack } = payload;
        const existing = _.find(processes, { processName: processName });
        const panes = yield selectSplitPane(state);
        const { FirstPane, SecondPane }: any = Object.assign({}, panes);

        if (existing) {
            const firstIndex = _.findIndex(FirstPane.tabs, { processName: processName });
            const secondIndex = _.findIndex(SecondPane.tabs, { processName: processName });
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
            const newProcessState = [...processes, { GUID: GUID, processName: processName }];
            yield put(callProcessActions.success(newProcessState));
            let newFirstPane = { ...FirstPane };
            let { tabs } = newFirstPane || [];
            tabs = [...tabs, { GUID: GUID, tabName: processName, processName: processName, searchKey: "", breadCrumbs: [] }];
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
        const { request, isUserTriggered, callBack, key } = payload;
        const processName = _.get(request, 'event.processName');
        const existing = _.find(processes, { processName: processName });
        const panes = yield selectSplitPane(store.getState());
        const { FirstPane, SecondPane }: any = Object.assign({}, panes);

        if (existing && isUserTriggered) {
            const firstIndex = _.findIndex(FirstPane.tabs, { processName: processName });
            const secondIndex = _.findIndex(SecondPane.tabs, { processName: processName });
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
                const newProcessState = [...processes, { GUID: payload.guid, processName: processName, processData: resp.data }];
                if (resp.data && resp.data.constructOutputData && resp.data.constructOutputData.uiResource && resp.data.constructOutputData.uiResource.presentations) {
                    yield put(callProcessActions.success(newProcessState));
                    const breadCrumbItem = PresentationHelper.createBreadCrumbItem(resp.data.constructOutputData);
                    const breadCrumb = PresentationHelper.addBreadCrumbs(breadCrumbItem, []);
                    let newFirstPane = { ...FirstPane };
                    let { tabs } = newFirstPane || [];
                    tabs = [...tabs, { GUID: payload.guid, tabName: key, processName: processName, searchKey: "", breadCrumbs: breadCrumb }];
                    newFirstPane = { ...newFirstPane, tabs: tabs, currentTab: processName };
                    yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane }));
                }
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
        const firstIndex = _.findIndex(FirstPane.tabs, { processName: processKey });
        const secondIndex = _.findIndex(SecondPane.tabs, { processName: processKey });
        let newFirstPane = { ...FirstPane };
        let newSecondPane = { ...SecondPane };

        if (secondIndex === -1 && action === "add") {
            if (firstIndex > -1) {
                newSecondPane = { ...SecondPane, tabs: [...SecondPane.tabs, FirstPane.tabs[firstIndex]], currentTab: processKey };
                newFirstPane = {
                    ...FirstPane,
                    tabs: [...FirstPane.tabs.slice(0, firstIndex), ...FirstPane.tabs.slice(firstIndex + 1)],
                    currentTab: firstIndex > 0 ? FirstPane.tabs[firstIndex - 1].processName : FirstPane.tabs[0].processName
                };
            }
        }
        if (secondIndex > -1 && action === "remove") {
            newSecondPane = {
                ...SecondPane,
                tabs: [...SecondPane.tabs.slice(0, secondIndex), ...SecondPane.tabs.slice(secondIndex + 1)],
                currentTab: secondIndex > 0 ? SecondPane.tabs[secondIndex - 1].processName : SecondPane.tabs[0].processName
            };
            newFirstPane = { ...FirstPane, tabs: [...FirstPane.tabs, SecondPane.tabs[secondIndex]] };

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
        const firstIndex = _.findIndex(FirstPane.tabs, { processName: processKey });
        const secondIndex = _.findIndex(SecondPane.tabs, { processName: processKey });
        let newFirstPane = { ...FirstPane };
        let newSecondPane = { ...SecondPane };

        const newProcess = _.filter(processes, process => {
            return process.processName !== processKey;
        });

        yield put(callProcessActions.success(newProcess));

        if (firstIndex !== -1) {
            newFirstPane = {
                ...FirstPane,
                tabs: [...FirstPane.tabs.slice(0, firstIndex), ...FirstPane.tabs.slice(firstIndex + 1)],
                currentTab: FirstPane.currentTab === processKey ? FirstPane.tabs[0].processName : FirstPane.currentTab
            };
        }

        if (secondIndex !== -1) {
            newSecondPane = {
                ...SecondPane,
                tabs: [...SecondPane.tabs.slice(0, secondIndex), ...SecondPane.tabs.slice(secondIndex + 1)],
                currentTab: SecondPane.currentTab === processKey ? SecondPane.tabs[0].processName : SecondPane.currentTab
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

function* setSearchKey({ payload }: ReturnType<typeof setSearchKeyAction>) {
    const { searchKey, processName } = payload;
    const panes: any = selectSplitPane(store.getState());
    const processes = yield selectProcessState(store.getState());

    const { FirstPane, SecondPane } = panes;
    const firstIndex = _.findIndex(FirstPane.tabs, { processName: processName });
    const secondIndex = _.findIndex(SecondPane.tabs, { processName: processName });


    if (firstIndex > -1) {
        const newFirstPane = {
            ...FirstPane, tabs: FirstPane.tabs.map((tab, index) =>
                index === firstIndex ? { ...tab, searchKey: searchKey } : tab
            )
        }
        yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane }));
    }
    if (secondIndex > -1) {
        const newSecondPane = {
            ...SecondPane, tabs: SecondPane.tabs.map((tab, index) =>
                index === secondIndex ? { ...tab, searchKey: searchKey } : tab
            )
        }
        yield put(setSplitAction.success({ FirstPane, SecondPane: newSecondPane }));
    }
}

function* getProcessData({ payload }: ReturnType<typeof callProcessDataActions.request>) {
    try {
        const { request, callBack } = payload;
        const processName = _.get(request, 'event.processName');
        const resp = yield call(api.process, request);
        const processes = yield selectProcessState(store.getState());
        const existing = _.find(processes, { processName: processName });
        const newData = _.merge({}, existing.processData, resp.data);
        const newObj = { GUID: existing.GUID, processName: processName, processData: newData };
        const newProcessState = [...processes.filter(process => process.processName != processName), { ...newObj }];
        yield put(callProcessActions.success(newProcessState));
    } catch (ex) {
        console.log(ex);
    }
}

function* continueProcess({ payload }: any) {
    try {
        const { newProcessData, processName } = payload;
        const processes = yield selectProcessState(store.getState());
        const existingIndex = _.findIndex(processes, { processName: processName });
        const existing = _.find(processes, { processName: processName });
        const newProcessName = newProcessData.constructOutputData.uiResource.stepInfo.processName;
        const newObj = { GUID: existing.GUID, processName: newProcessName, processData: newProcessData };
        const newProcessState = [...processes.filter(process => process.processName != processName), { ...newObj }];
        yield put(callProcessActions.success(newProcessState));

        const panes: any = selectSplitPane(store.getState());
        const { FirstPane, SecondPane } = panes;
        const firstIndex = _.findIndex(FirstPane.tabs, { processName: processName });
        const secondIndex = _.findIndex(SecondPane.tabs, { processName: processName });
        const { primaryEntity, formName, presentationRules, embedPresentations, presentation, stepInfo } = ProcessHelper.getUIResourceDetails(newProcessData.constructOutputData);
        const breadCrumbItem = PresentationHelper.createBreadCrumbItem(newProcessData.constructOutputData);
        if (firstIndex > -1) {
            const breadCrumb = PresentationHelper.addBreadCrumbs(breadCrumbItem, FirstPane.tabs[firstIndex].breadCrumbs);
            const newFirstPane = {
                ...FirstPane, currentTab: newProcessName, tabs: FirstPane.tabs.map((tab, index) =>
                    index === firstIndex ? { GUID: tab.GUID, tabName: presentation.headerName, processName: newProcessName, searchKey: "", breadCrumbs: breadCrumb } : tab
                )
            }
            yield put(setSplitAction.success({ FirstPane: newFirstPane, SecondPane }));
        }
        if (secondIndex > -1) {
            const breadCrumb = PresentationHelper.addBreadCrumbs(breadCrumbItem, SecondPane.tabs[secondIndex].breadCrumbs);
            const newSecondPane = {
                ...SecondPane, currentTab: newProcessName, tabs: SecondPane.tabs.map((tab, index) =>
                    index === secondIndex ? { GUID: tab.GUID, tabName: presentation.headerName, processName: newProcessName, searchKey: "", breadCrumbs: breadCrumb } : tab
                )
            }
            yield put(setSplitAction.success({ FirstPane, SecondPane: newSecondPane }));
        }


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
    yield takeLatest(setSearchKeyAction, setSearchKey);
    yield takeLatest(continueProcessAction, continueProcess);
}