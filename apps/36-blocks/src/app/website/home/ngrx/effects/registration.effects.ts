import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { errorResolver } from '@proxy/models/root-models';
import { UsersService } from '@proxy/services/proxy/users';
import * as registrationActions from '../actions/registration.action';

@Injectable()
export class RegistrationEffects {
    private readonly actions$ = inject(Actions);
    private readonly usersService = inject(UsersService);

    registrationSubmit$ = createEffect(() =>
        this.actions$.pipe(
            ofType(registrationActions.registrationSubmitAction),
            switchMap(({ payload }) =>
                this.usersService.register(payload).pipe(
                    map((response) =>
                        registrationActions.registrationSubmitComplete({
                            registeredEmail: payload.email,
                        })
                    ),
                    catchError((error) => {
                        const errorBody = error?.error;
                        const resolvedMessage =
                            errorBody?.errors?.message ||
                            errorBody?.data?.message ||
                            errorBody?.message ||
                            error?.message ||
                            'Registration failed. Please try again.';
                        return of(
                            registrationActions.registrationSubmitError({
                                errors: errorResolver(resolvedMessage),
                            })
                        );
                    })
                )
            )
        )
    );
}
