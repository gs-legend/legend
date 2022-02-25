import { createAsyncAction, ActionType, createReducer } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";
import { DashboardResponse } from "core/types/Dashboard";
import { AppAndUserContext } from "core/types/AppAndUserContext";


type KgmServiceState = Readonly<{
    appAndUserContext: AppAndUserContext,
    dashboard: DashboardResponse
}>;


export const getOnLoadActions = createAsyncAction(
    'kgmService/GETONLOAD_REQUEST',
    'kgmService/GETONLOAD_SUCCESS',
    'kgmService/GETONLOAD_FAILURE'
)<{}, KgmServiceState, undefined>();

const actions = { getOnLoadActions };
export type KgmServiceAction = ActionType<typeof actions>;

const initialState: KgmServiceState = {
    appAndUserContext: null as any,
    dashboard: null as any
};

const onLoadState = createReducer(initialState)
    .handleAction(getOnLoadActions.success, (_, { payload: { appAndUserContext, dashboard } }) => { return { appAndUserContext, dashboard } })
    .handleAction(getOnLoadActions.failure, () => initialState);

export const kgmServiceReducer = combineReducers({
    onLoadState
});

export const selectKgmServiceState = (state: RootState) => state.kgmService;
export const selectOnLoadState = (state: RootState) => selectKgmServiceState(state).onLoadState;
