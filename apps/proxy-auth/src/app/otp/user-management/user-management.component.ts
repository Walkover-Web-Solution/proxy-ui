import { NgStyle } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { getUserDetails, getUserManagementDetails } from '../store/actions/otp.action';
import { Store } from '@ngrx/store';
import { IAppState } from '../store/app.state';
import { BaseComponent } from '@proxy/ui/base-component';

@Component({
    selector: 'proxy-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
})
export class UserManagementComponent extends BaseComponent {
    @Input() public userManage: string;
    @Input() public authToken: string;
    @Input() public target: string;
    @Input()
    // set css(type: NgStyle['ngStyle']) {
    //     this.cssSubject$.next(type);
    // }
    // private readonly cssSubject$: NgStyle['ngStyle'] = new BehaviorSubject({
    //     position: 'absolute',
    //     'margin-left': '50%',
    //     top: '10px',
    // });
    // readonly css$ = this.cssSubject$.pipe(
    //     map((type) =>
    //         !type || !Object.keys(type).length
    //             ? {
    //                   position: 'absolute',
    //                   'margin-left': '50%',
    //                   top: '10px',
    //               }
    //             : type
    //     )
    @Input()
    public successReturn: (arg: any) => any;
    @Input() public failureReturn: (arg: any) => any;
    @Input() public otherData: { [key: string]: any } = {};

    constructor(private store: Store<IAppState>) {
        console.log('UserManagementComponent constructed');
        super();
    }

    displayedColumns = ['name', 'user', 'rule', 'action'];

    dataSource = [
        {
            name: 'John Doe',
            user: 'johndoe',
            rule: 'Admin',
            action: 'Edit',
        },
        {
            name: 'Jane Smith',
            user: 'janesmith',
            rule: 'User',
            action: 'Invite',
        },
        {
            name: 'Jane Smith',
            user: 'janesmith',
            rule: 'User',
            action: 'Invite',
        },
        {
            name: 'Jane Smith',
            user: 'janesmith',
            rule: 'User',
            action: 'Invite',
        },
        {
            name: 'Jane Smith',
            user: 'janesmith',
            rule: 'User',
            action: 'Invite',
        },
        {
            name: 'Jane Smith',
            user: 'janesmith',
            rule: 'User',
            action: 'Invite',
        },
    ];

    ngOnInit() {
        console.log('userManage in component:', this.authToken);
        this.store.dispatch(getUserManagementDetails({ request: this.userManage }));
    }
}
