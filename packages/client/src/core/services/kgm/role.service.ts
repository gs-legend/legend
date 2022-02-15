import { createAsyncAction, createReducer, ActionType } from "typesafe-actions";
import { combineReducers } from "redux";
import { RootState } from "core/store";
import { GetUserResponse } from "../ApiTypes";

export const getUserActions = createAsyncAction(
    'roleService/GETUSER_REQUEST',
    'roleService/GETUSER_SUCCESS',
    'roleService/GETUSER_FAILURE'
)<{}, GetUserResponse, undefined>();

const actions = { getUserActions };
export type RoleServiceAction = ActionType<typeof actions>;

type RoleServiceState = Readonly<{
    userContext: GetUserResponse;
}>;

const initialState: RoleServiceState = {
    userContext: null as any
};

const userContext = createReducer(initialState.userContext)
    .handleAction(getUserActions.success, (_, { payload: { userId, userdomain, fullName } }) => {
        return {
            userId, userdomain, fullName
        }
    })
    .handleAction(getUserActions.failure, () => initialState.userContext);

export const roleServiceReducer = combineReducers({
    userContext
});

export const selectRoleServiceState = (state: RootState) => state.role;
export const selectUserContext = (state: RootState) => selectRoleServiceState(state).userContext;

