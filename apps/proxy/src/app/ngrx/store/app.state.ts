import { Action, ActionReducer, ActionReducerMap } from '@ngrx/store';
import { logoutAction } from '../../auth/ngrx/actions';
import * as rootReducer from './reducer/root.reducer';

export interface IAppState {
    root: rootReducer.IRootState;
}

export const reducers: ActionReducerMap<IAppState> = {
    root: rootReducer.rootReducer,
};

export function clearStateMetaReducer<State extends {}>(reducer: ActionReducer<State>): ActionReducer<State> {
    return function clearStateFn(state: State, action: Action) {
        if (action.type === logoutAction.type) {
            state = {} as State; // ==> Emptying state here
        }
        return reducer(state, action);
    };
}
