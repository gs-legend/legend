import { createAsyncAction, createReducer, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";
import { DashboardResponse, ThemeRequest } from "core/types/Dashboard";

export const getDashboardActions = createAsyncAction(
    'presentationService/GETDASHBOARD_REQUEST',
    'presentationService/GETDASHBOARD_SUCCESS',
    'presentationService/GETDASHBOARD_FAILURE'
)<{}, DashboardResponse, undefined>();

export const getThemeActions = createAsyncAction(
    'presentationService/GETHEME_REQUEST',
    'presentationService/GETHEME_SUCCESS',
    'presentationService/GETHEME_FAILURE'
)<ThemeRequest, string, undefined>();

const actions = { getDashboardActions, getThemeActions };
export type PresentationServiceAction = ActionType<typeof actions>;

type PresentationServiceState = Readonly<{
    dashboard: DashboardResponse,
    theme: string
}>;

const initialState: PresentationServiceState = {
    dashboard: null as any,
    theme: 'light'
};

const dashboard = createReducer(initialState.dashboard)
    .handleAction(getDashboardActions.success, (_, { payload: dashboard }) => dashboard)
    .handleAction(getDashboardActions.failure, () => initialState.dashboard);


const theme = createReducer(initialState.theme)
    .handleAction(getThemeActions.success, (_, { payload: theme }) => theme)
    .handleAction(getThemeActions.failure, () => initialState.theme);

export const presentationServiceReducer = combineReducers({
    dashboard,
    theme
});

export const selectPresentationServiceState = (state: RootState) => state.presentationService;
export const selectDashboard = (state: RootState) => selectPresentationServiceState(state).dashboard;
export const selectTheme = (state: RootState) => selectPresentationServiceState(state).theme;
