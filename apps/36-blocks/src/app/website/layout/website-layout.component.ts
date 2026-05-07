import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterModule, ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import * as logInActions from '../home/ngrx/actions/login.action';
import * as registrationActions from '../home/ngrx/actions/registration.action';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-website-layout',
    imports: [RouterModule],
    templateUrl: './website-layout.component.html',
    styleUrl: './website-layout.component.scss',
})
export class WebsiteLayoutComponent implements OnInit, OnDestroy {
    private readonly document = inject(DOCUMENT);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly store = inject(Store);

    public readonly headerNavLinks: { label: string; ariaLabel: string; route: string }[] = [
        { label: 'Home', ariaLabel: '36Blocks home', route: '/' },
        { label: 'Pricing', ariaLabel: '36Blocks Pricing plans', route: '/pricing' },
        { label: 'Contact', ariaLabel: 'Contact 36Blocks', route: '/contact' },
    ];

    public readonly footerLinks: { label: string; ariaLabel: string; route?: string; href?: string }[] = [
        { label: 'About Us', ariaLabel: '36Blocks About us', route: '/about' },
        { label: 'Documentation', ariaLabel: '36Blocks Documentation', href: 'https://36blocks.com/help' },
        { label: 'Security', ariaLabel: '36Blocks Security information', route: '/security' },
        { label: 'Privacy', ariaLabel: '36Blocks Privacy policy', route: '/privacy' },
        { label: 'Terms', ariaLabel: '36Blocks Terms of service', route: '/terms' },
    ];

    private readonly routeData$ = this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        startWith(null),
        map(() => {
            let currentRoute = this.activatedRoute;
            while (currentRoute.firstChild) {
                currentRoute = currentRoute.firstChild;
            }
            return currentRoute.snapshot?.data ?? {};
        })
    );

    public readonly routeData = toSignal(this.routeData$, { initialValue: {} });

    public get hideHeader(): boolean {
        return !!this.routeData()?.['hideHeader'];
    }

    public get hideFooter(): boolean {
        return !!this.routeData()?.['hideFooter'];
    }

    public ngOnInit(): void {
        this.document.body.classList.add('website-active');
    }

    public ngOnDestroy(): void {
        this.document.body.classList.remove('website-active');
    }

    public readonly mobileMenuOpen = signal(false);

    public toggleMobileMenu(): void {
        this.mobileMenuOpen.update((open) => !open);
    }

    public closeMobileMenu(): void {
        this.mobileMenuOpen.set(false);
    }

    public login(): void {
        this.closeMobileMenu();
        this.store.dispatch(logInActions.logInAction());
    }

    /**
     * routerLink to /register is a no-op when already on /register, so the register page
     * never re-initializes and the post-sign-up banner stays visible. Reset registration
     * state so the form shows again.
     */
    public onRegisterCtaClick(): void {
        const path = this.router.url.split('?')[0].split('#')[0];
        if (path === '/register') {
            this.store.dispatch(registrationActions.registrationResetAction());
        }
    }
}
