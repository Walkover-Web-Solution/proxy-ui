import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateChildFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AiSetupService } from './ai-setup.service';
import { SETUP_ROUTE, isRedirectableRoute, readSkipped, shouldRedirectToSetup } from './setup-redirect';

/**
 * Child guard of the dashboard layout: a workspace without blocks is sent to the AI setup wizard before any dashboard
 * page renders (first sign-in, and again after switching to such a workspace, because a switch reloads the page).
 * Only the dashboard entry pages are checked, so deep links, the wizard and the manual create flow are never delayed
 * or redirected. A failed or denied block list never redirects: the user stays where they were going.
 */
export const zeroBlocksGuard: CanActivateChildFn = (_route, state) => {
    if (!isPlatformBrowser(inject(PLATFORM_ID)) || !isRedirectableRoute(state.url)) return true;
    const router = inject(Router);
    return inject(AiSetupService)
        .resolveWorkspace()
        .pipe(
            map((workspace) =>
                shouldRedirectToSetup({
                    ...workspace,
                    url: state.url,
                    skipped: workspace.clientId !== null && readSkipped(workspace.clientId),
                })
                    ? router.createUrlTree([SETUP_ROUTE])
                    : true
            ),
            catchError(() => of(true))
        );
};
