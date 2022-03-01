import { createAsyncAction, ActionType, createReducer, createAction } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";

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


export const callProcessDataActions = createAsyncAction(
    'processService/GETPROCESS_DATA_REQUEST',
    'processService/GETPROCESS_DATA_SUCCESS',
    'processService/GETPROCESS_DATA_FAILURE'
)<any, any, undefined>();

export const callProcessTriggerActions = createAsyncAction(
    'processService/GETPROCESS_TRIGGER_REQUEST',
    'processService/GETPROCESS_TRIGGER_SUCCESS',
    'processService/GETPROCESS_TRIGGER_FAILURE'
)<any, any, undefined>();

export const callStaticProcessActions = createAsyncAction(
    'processService/GETSTATICPROCESS_REQUEST',
    'processService/GETSTATICPROCESS_SUCCESS',
    'processService/GETSTATICPROCESS_FAILURE'
)<any, any, any>();

export const callProcessSubmitAction = createAsyncAction(
    'processService/GETPROCESS_SUBMIT_REQUEST',
    'processService/GETPROCESS_SUBMIT_SUCCESS',
    'processService/GETPROCESS_SUBMIT_FAILURE'
)<any, any, undefined>();

export const setSearchKeyAction = createAction('processService/SETCURRENTSEARCHKEY')<any>();
export const setCurrentPaneKeyAction = createAction('processService/SETCURRENTPANEKEY')<any>();
export const removeProcessAction = createAction('processService/REMOVEPROCESS')<any>();
export const getDropdownDataAction = createAction('processService/GETDROPDOWNDATA')<any, any>();

const actions = { callStaticProcessActions, callProcessActions, callProcessDataActions, callProcessSubmitAction, setSplitAction, setCurrentPaneKeyAction, removeProcessAction,setSearchKeyAction };
export type ProcessServiceAction = ActionType<typeof actions>;


export type ProcessPane = {
    tabs: Array<ProcessTab>,
    currentTab: string
}

export type ProcessTab = {
    GUID: string;
    tabName: string;
    processName: string;
    searchKey?: string;
}

export type ProcessPanes = {
    FirstPane: ProcessPane,
    SecondPane: ProcessPane
}

export type ProcessServiceState = Readonly<{
    processState: Array<any>;
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
    .handleAction(callProcessActions.success, (_, { payload: processState }) => {
        return processState;
    })
    .handleAction(callStaticProcessActions.success, (_, { payload: processState }) => {
        return processState;
    })
    .handleAction(callProcessDataActions.success, (_, { payload: processState }) => {
        return processState;
    })

const panes = createReducer(initialState.panes)
    .handleAction(setSplitAction.success, (_, { payload: panes }) => {
        return panes;
    });

export const processServiceReducer = combineReducers({
    processState,
    panes
});

export const selectProcessServiceState = (state: RootState) => state.processService;
export const selectProcessState = (state: RootState) => selectProcessServiceState(state).processState;
export const selectSplitPane = (state: RootState) => selectProcessServiceState(state).panes;