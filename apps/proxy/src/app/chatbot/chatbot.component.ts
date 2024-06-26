import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RootService } from '@proxy/services/proxy/root';
import { environment } from '../../environments/environment';
import { AuthService } from '@proxy/services/proxy/auth';
import { IClientSettings, IFirebaseUserModel } from '@proxy/models/root-models';
import { Observable, combineLatest, distinctUntilChanged, takeUntil } from 'rxjs';
import { isEqual } from 'lodash';
import { ILogInFeatureStateWithRootState } from '../auth/ngrx/store/login.state';
import { Store, select } from '@ngrx/store';
import { selectLogInData } from '../auth/ngrx/selector/login.selector';
import { AppComponent } from '../app.component';

@Component({
    selector: 'app-chatbot',
    template: `<p></p>`,
})
export class ChatbotComponent {}
