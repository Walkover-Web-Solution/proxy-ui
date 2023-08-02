import { NgModule, Inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import { IToken, ProxyBaseUrls } from '@proxy/models/root-models';
import * as dayjs from 'dayjs';
import { CookieService } from 'ngx-cookie-service';

@NgModule({
    imports: [CommonModule],
})
export class ServicesProxyAuthModule {}

@Injectable({
    providedIn: ServicesProxyAuthModule,
})
export class AuthService {
    constructor(
        private afAuth: AngularFireAuth,
        @Inject(ProxyBaseUrls.IToken) private token: IToken,
        private cookieService: CookieService
    ) {}

    public cookieExpireDate = new Date(dayjs().add(30, 'day').toString());

    public loginViaGoogle(): Observable<firebase.auth.UserCredential> {
        const provider = new firebase.auth.GoogleAuthProvider();
        return from(this.afAuth.signInWithPopup(provider)).pipe(
            map((res) => {
                const data: firebase.auth.UserCredential = res;
                return data;
            })
        );
    }

    public getToken(fetchRefreshToken: boolean = false): Observable<string> {
        return this.afAuth.authState.pipe(switchMap((p) => p.getIdToken(fetchRefreshToken)));
    }

    public fetchActiveToken(): void {
        this.getToken()
            .pipe(take(1))
            .subscribe((token) => {
                this.token.token = token;
            });
    }

    public getFCMTokenSync(): string {
        return this.token.token;
    }

    public setTokenSync(token): void {
        this.cookieService.set('authToken', token, this.cookieExpireDate, '/');
        this.token.proxyJWTToken = token;
    }

    public getTokenSync(): string {
        return this.token.proxyJWTToken;
    }

    public clearTokenSync(): void {
        this.cookieService.delete('authToken', '/');
        this.token.proxyJWTToken = null;
    }
}
