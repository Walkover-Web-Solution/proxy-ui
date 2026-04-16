import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    inject,
    signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MainLeftSideNavComponent } from './main-left-side-nav/main-left-side-nav.component';
import { SidebarUserMenuComponent } from './sidebar-user-menu/sidebar-user-menu.component';
import { IClient, IClientSettings, IFirebaseUserModel, IPaginatedResponse } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../../website/home/ngrx/selector/login.selector';
import { isEqual } from 'lodash-es';
import { Observable, distinctUntilChanged, filter, takeUntil, combineLatest } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../../website/home/ngrx/store/login.state';
import * as logInActions from '../../website/home/ngrx/actions/login.action';
import { rootActions } from '../../core/ngrx/actions';
import { selectAllClient, selectClientSettings, selectSwitchClientSuccess } from '../../core/ngrx';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RootService } from '@proxy/services/proxy/root';
import { environment } from '../../../environments/environment';
import { AuthService } from '@proxy/services/proxy/auth';
import { SideNavService } from './side-nav.service';
import { UiSettingsService } from './ui-settings.service';
import { FeaturesService } from '@proxy/services/proxy/features';
import { take } from 'rxjs/operators';
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-layout',
    imports: [
        RouterModule,
        CommonModule,
        MatMenuModule,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatListModule,
        MatSidenavModule,
        MatToolbarModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSlideToggleModule,
        ScrollingModule,
        MainLeftSideNavComponent,
        SidebarUserMenuComponent,
    ],
    host: { class: 'flex w-full h-screen' },
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends BaseComponent implements OnInit, OnDestroy {
    public logInData$: Observable<IFirebaseUserModel>;
    public clientSettings$: Observable<IClientSettings>;
    public clients$: Observable<IPaginatedResponse<IClient[]>>;
    public swtichClientSuccess$: Observable<boolean>;

    public isDarkMode = signal<boolean>(false);

    public toggleMenuSideBar: boolean;
    public showContainer = false;
    public clientsParams = {
        itemsPerPage: 200,
        pageNo: 1,
    };

    private store = inject<Store<ILogInFeatureStateWithRootState>>(Store);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private rootService = inject(RootService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    public sideNavService = inject(SideNavService);
    private uiSettings = inject(UiSettingsService);
    private featuresService = inject(FeaturesService);

    constructor() {
        super();
        this.logInData$ = this.store.pipe(
            select(selectLogInData),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clientSettings$ = this.store.pipe(
            select(selectClientSettings),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.clients$ = this.store.pipe(
            select(selectAllClient),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );
        this.swtichClientSuccess$ = this.store.pipe(
            select(selectSwitchClientSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.showContainer = event?.url?.includes('chatbot');
            const container = document.getElementById('ChatbotContainer');
            if (container) {
                container.style.display = this.showContainer ? 'block' : 'none';
            }
            if (event?.url?.startsWith('/widget-preview')) {
                (window as any).closeChatbot?.();
            }
            if (event?.url?.includes('/features/create')) {
                this.featuresService
                    .getFeature({ itemsPerPage: 1, pageNo: 1 })
                    .pipe(take(1))
                    .subscribe((res) => {
                        const hasFeatures = (res?.data?.totalEntityCount ?? 0) > 0;
                        this.sideNavService.hideSidebar.set(!hasFeatures);
                        this.cdr.markForCheck();
                    });
            } else {
                this.sideNavService.hideSidebar.set(false);
            }
            this.cdr.markForCheck();
        });
    }
    ngOnInit(): void {
        this.getClients();
        this.getClientSettings();
        this.getCurrentTheme();
        document.body.classList.remove('website-active');

        if (this.isMobileDevice()) {
            this.sideNavService.close();
        }
        this.swtichClientSuccess$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
            if (res) {
                location.href = '/app';
            }
        });

        combineLatest([this.logInData$, this.clientSettings$]).subscribe(([loginData, clientSettings]) => {
            if (loginData && clientSettings) {
                this.rootService.generateToken({ source: 'chatbot' }).subscribe((res) => {
                    const scriptId = 'chatbot-main-script';
                    const existingScript = document.getElementById(scriptId);
                    if (existingScript) {
                        existingScript.remove();
                    }
                    const scriptElement = document.createElement('script');
                    scriptElement.type = 'text/javascript';
                    scriptElement.src = environment.interfaceScriptUrl;
                    scriptElement.id = scriptId;
                    scriptElement.setAttribute('embedToken', res?.data?.jwt);
                    scriptElement.setAttribute('parentId', 'ChatbotContainer');
                    scriptElement.setAttribute('fullScreen', 'true');
                    scriptElement.setAttribute('hideIcon', 'true');
                    scriptElement.setAttribute('hideCloseButton', 'true');

                    scriptElement.onload = () => {
                        const payload = {
                            variables: {
                                variables: JSON.stringify({
                                    session: this.authService.getTokenSync(),
                                }),
                            },
                            threadId: `${loginData?.email}${clientSettings?.client?.id}`,
                            bridgeName: 'root',
                            parentId: 'ChatbotContainer',
                            fullScreen: true,
                        };
                        setTimeout(() => {
                            if (this.router.url.startsWith('/widget-preview')) {
                                return;
                            }
                            (window as any).SendDataToChatbot(payload);
                            (window as any).openChatbot();
                            // Body have class light-theme
                            if (document.body.classList.contains('light-theme')) {
                                this.sendThemeToChatbot('light');
                            } else {
                                this.sendThemeToChatbot('dark');
                            }
                        }, 2000);
                    };

                    document.body.appendChild(scriptElement);
                });
            }
        });
    }

    public logOut() {
        this.store.dispatch(logInActions.logoutAction());
    }

    public getClients() {
        this.store.dispatch(rootActions.getAllClients({ params: this.clientsParams }));
    }

    public getClientSettings() {
        this.store.dispatch(rootActions.getClientSettings());
    }

    public switchClient(clientId: number): void {
        this.store.dispatch(rootActions.switchClient({ request: { client_id: clientId } }));
    }

    public getCurrentTheme() {
        this.switchedDarkMode(this.uiSettings.theme === 'dark-theme');
    }

    public switchedDarkMode(isDarkMode: boolean) {
        const hostClass = isDarkMode ? 'dark-theme' : 'light-theme';
        this.uiSettings.setTheme(hostClass);
        this.isDarkMode.set(isDarkMode);

        // This GTWY chatbot config for forced theme
        this.sendThemeToChatbot(this.isDarkMode() ? 'dark' : 'light');
    }

    private sendThemeToChatbot(theme: 'light' | 'dark'): void {
        (window as any).Chatbot?.sendData({ theme });
    }

    public isMobileDevice() {
        const w = document.documentElement.clientWidth;
        const breakpoint = 992;
        if (w <= breakpoint) {
            return true;
        } else {
            return false;
        }
    }

    public toggleSideBarEvent(): void {
        this.sideNavService.toggle();
    }
}
