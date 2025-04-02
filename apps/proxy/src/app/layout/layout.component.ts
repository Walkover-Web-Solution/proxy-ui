import { Component, OnDestroy, OnInit } from '@angular/core';
import { IClient, IClientSettings, IFirebaseUserModel, IPaginatedResponse } from '@proxy/models/root-models';
import { BaseComponent } from '@proxy/ui/base-component';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../auth/ngrx/selector/login.selector';
import { isEqual } from 'lodash';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, takeUntil, combineLatest } from 'rxjs';
import { ILogInFeatureStateWithRootState } from '../auth/ngrx/store/login.state';
import * as logInActions from '../auth/ngrx/actions/login.action';
import { rootActions } from '../ngrx/actions';
import { selectAllClient, selectClientSettings, selectSwtichClientSuccess } from '../ngrx';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { RootService } from '@proxy/services/proxy/root';
import { environment } from '../../environments/environment';
import { AuthService } from '@proxy/services/proxy/auth';
@Component({
    selector: 'proxy-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent extends BaseComponent implements OnInit, OnDestroy {
    public logInData$: Observable<IFirebaseUserModel>;
    public clientSettings$: Observable<IClientSettings>;
    public clients$: Observable<IPaginatedResponse<IClient[]>>;
    public swtichClientSuccess$: Observable<boolean>;

    public isSideNavOpen = new BehaviorSubject<boolean>(true);

    public toggleMenuSideBar: boolean;
    public showContainer = false;
    public clientsParams = {
        itemsPerPage: 25,
        pageNo: 1,
    };
    constructor(
        private store: Store<ILogInFeatureStateWithRootState>,

        private router: Router,
        private route: ActivatedRoute,
        private rootService: RootService,
        private authService: AuthService
    ) {
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
            select(selectSwtichClientSuccess),
            distinctUntilChanged(isEqual),
            takeUntil(this.destroy$)
        );

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
            this.showContainer = event?.url?.includes('chatbot');
            const container = document.getElementById('ChatbotContainer');
            if (container) {
                container.style.display = this.showContainer ? 'block' : 'none';
            } else {
                console.error('Element with ID "chatbotContainer" not found');
            }
        });
    }
    ngOnInit(): void {
        this.getClients();
        this.getClientSettings();
        this.getCurrentTheme();

        if (this.isMobileDevice()) {
            this.toggleSideBarEvent();
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
                        console.log('SendDataToChatbot ==>', payload);
                        setTimeout(() => {
                            (window as any).SendDataToChatbot(payload);
                            (window as any).openChatbot();
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

    public fetchClientsNextPage() {
        if (this.clientsParams.pageNo < this.getValueFromObservable(this.clients$)?.totalPageCount) {
            this.clientsParams = {
                ...this.clientsParams,
                pageNo: this.clientsParams.pageNo + 1,
            };
            this.getClients();
        }
    }

    public switchClient(clientId: number): void {
        this.store.dispatch(rootActions.switchClient({ request: { client_id: clientId } }));
    }

    public getCurrentTheme() {
        if (
            localStorage.getItem('selected-theme') === null ||
            localStorage.getItem('selected-theme') === 'light-theme'
        ) {
            this.switchedDarkMode(false);
        } else {
            this.switchedDarkMode(true);
        }
    }

    switchedDarkMode(isDarkMode: boolean) {
        const hostClass = isDarkMode ? 'dark-theme' : 'light-theme';
        localStorage.setItem('selected-theme', hostClass);
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
        this.isSideNavOpen.next(!this.isSideNavOpen.getValue());
    }
}
