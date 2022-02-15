import { createAsyncAction, ActionType, createReducer, createAction } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";

export const createStartRequest = (processName: string) => {
    return {
        event: { processName: processName },
        fromUi: true,
        windowId: window.sessionStorage.WINDOWID,
        guid: window.sessionStorage.GUID,
        uiEvent: {
            uiEventName: 'START',
            uiEventType: null,
            uiEventValue: 'start'
        },
        inputData: {
            processName: processName,
            nextStepToBeexecuted: null,
            detailedObjects: {} as any,
            verbProperties: {},
            previousProcessName: undefined,
            properties: {
                fromUI: true,
                windowId: window.sessionStorage.WINDOWID,
                guid: window.sessionStorage.GUID,
            }
        }
    };
};

export const createLoadRequest = (process: string) => {
    return {
        event: { processName: process },
        fromUi: true,
        windowId: window.sessionStorage.WINDOWID,
        guid: window.sessionStorage.GUID,
        uiEvent: {
            uiEventName: 'ONLOAD',
            uiEventType: null,
            uiEventValue: ""
        },
        inputData: {
            processName: process,
            detailedObjects: {} as any,
            changeFor: {} as any,
            verbProperties: {},
            properties: {
                fromUI: true,
                windowId: window.sessionStorage.WINDOWID,
                guid: window.sessionStorage.GUID,
            }
        }
    }
}

export const generateGUID = () => {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
};

export const setWindowId = () => {
    window.sessionStorage.WINDOWID = window.sessionStorage.WINDOWID || generateGUID();
};

export const setGuid = () => {
    window.sessionStorage.GUID = generateGUID();
    let GUID_HISTORY = getGuidHistory();
    if (!GUID_HISTORY) {
        GUID_HISTORY = [];
    }
    GUID_HISTORY.push(window.sessionStorage.GUID);
    setGuidHistory(GUID_HISTORY);
};

const setGuidHistory = (data: Array<string>) => {
    window.sessionStorage.setItem('GUID_HISTORY', JSON.stringify(data));
};

const getGuidHistory = () => {
    const context = JSON.parse(window.sessionStorage.getItem('GUID_HISTORY') || "[]");
    return context;
};

export const callProcessActions = createAsyncAction(
    'processService/GETPROCESS_REQUEST',
    'processService/GETPROCESS_SUCCESS',
    'processService/GETPROCESS_FAILURE'
)<any, any, undefined>();

export const setSplitAction = createAsyncAction(
    'processService/SETSPLIT_REQUEST',
    'processService/SETSPLIT_SUCCESS',
    'processService/SETSPLIT_FAILURE'
)<any, ProcessPanes, undefined>();

export const setCurrentPaneKeyAction = createAction('processService/SETCURRENTPANEKEY')<any>();
export const removeProcessAction = createAction('processService/REMOVEPROCESS')<any>();

const actions = { callProcessActions, setSplitAction, setCurrentPaneKeyAction, removeProcessAction };
export type ProcessServiceAction = ActionType<typeof actions>;


export type ProcessPane = {
    tabs: Array<any>,
    currentTab: string
}

export type ProcessPanes = {
    FirstPane: ProcessPane,
    SecondPane: ProcessPane
}

export type ProcessServiceState = Readonly<{
    processState: any;
    panes: ProcessPanes;
}>;

const initialState: ProcessServiceState = {
    processState: [],
    panes: {
        FirstPane: {
            tabs: [],
            currentTab: ""
        },
        SecondPane: {
            tabs: [],
            currentTab: ""
        }
    }
};

const processState = createReducer(initialState.processState)
    .handleAction(callProcessActions.success, (_, { payload: processState }) => processState);

const panes = createReducer(initialState.panes)
    .handleAction(setSplitAction.success, (_, { payload: panes }) => panes);

export const processServiceReducer = combineReducers({
    processState,
    panes
});

export const selectProcessServiceState = (state: RootState) => state.processService;
export const selectProcessState = (state: RootState) => selectProcessServiceState(state).processState;
export const selectSplitPane = (state: RootState) => selectProcessServiceState(state).panes;