import { createAsyncAction, createReducer, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";
import { AppAndUserContext } from "core/types/AppAndUserContext";

export const getAppAndUserContextActions = createAsyncAction(
    'cacheService/GETAPPUSERCONTEXT_REQUEST',
    'cacheService/GETAPPUSERCONTEXT_SUCCESS',
    'cacheService/GETAPPUSERCONTEXT_FAILURE'
)<{}, AppAndUserContext, undefined>();

const actions = { getAppAndUserContextActions };
export type CacheServiceAction = ActionType<typeof actions>;

type CacheServiceState = Readonly<{
    appAndUserContext: AppAndUserContext;
}>;

const initialState: CacheServiceState = {
    appAndUserContext: null as any
};

const appAndUserContext = createReducer(initialState.appAndUserContext)
    .handleAction(getAppAndUserContextActions.success, (_, { payload: appAndUserContext }) => appAndUserContext)
    .handleAction(getAppAndUserContextActions.failure, () => initialState.appAndUserContext);

export const CacheServiceReducer = combineReducers({
    appAndUserContext
});

export const selectCacheServiceState = (state: RootState) => state.cacheService;
export const selectAppCacheServiceReducer = (state: RootState) => selectCacheServiceState(state).appAndUserContext;

