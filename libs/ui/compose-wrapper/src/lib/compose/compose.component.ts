import {
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '@proxy/ui/confirm-dialog';
import { DOCUMENT } from '@angular/common';
// import { Agent } from '../../hello/models/team';
// import { distinctUntilChanged, takeUntil } from 'rxjs/operators';
// import { isEqual } from 'lodash';
// import { select, Store } from '@ngrx/store';
// import { Agent } from 'http';
// import { IAppState } from '../../store/reducers/app.state';
// import { selectRootUserSetting } from '../../store/selectors';
// import { generalActions } from '../../store/actions';

@Component({
    selector: 'proxy-compose-wrapper',
    templateUrl: './compose.component.html',
    styleUrls: ['./compose.component.scss'],
})
export class ComposeWrapperComponent extends BaseComponent implements OnInit, OnDestroy, OnChanges {
    // public loggedInAgent$: Observable<IUserSetting>;
    // @Input() public loggedInAgent: Agent;
    @Input() public minimizeMailCompose: boolean = false;
    @Input() public fullScreenMailCompose: boolean = false;
    @Input() public composeTitle: string = '';
    @Output() public fullScreenMailComposeValue = new EventEmitter<boolean>();
    @Output() public minimizeMailComposeValue = new EventEmitter<boolean>();
    @Output() public closeDialogModel = new EventEmitter<any>();

    constructor(
        // private rootStore: Store<IAppState>,
        public dialog: MatDialog,
        // public dialogRef: MatDialogRef<ComposeDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        @Inject(DOCUMENT) private document: Document
    ) {
        super();

        // this.loggedInAgent$ = this.rootStore.pipe(
        //     select(selectRootUserSetting),
        //     distinctUntilChanged(isEqual),
        //     takeUntil(this.destroy$)
        // );
    }

    public ngOnInit(): void {
        // this.loggedInAgent$.pipe(distinctUntilChanged(isEqual), takeUntil(this.destroy$)).subscribe((res) => {
        //     this.loggedInAgent = {
        //         id: res?.id,
        //         email_id: res?.email,
        //         personal_number: res?.mobileNo,
        //         username: res?.userName,
        //         name: res?.firstName + ' ' + res?.lastName,
        //     };
        // });
    }

    public ngOnDestroy(): void {
        this.exitFullScreen();
        super.ngOnDestroy();
    }

    public onNoClick(): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(ConfirmDialogComponent);
        const componentInstance = dialogRef.componentInstance;
        componentInstance.confirmationMessage = `Are you sure you want to discard?`;
        componentInstance.confirmButtonText = 'Confirm';
        dialogRef.afterClosed().subscribe((action) => {
            if (action === 'yes') {
                // this.resetComposeState();
                // this.dialogRef.close();
                this.closeDialogModel.emit(null);
                this.exitFullScreen();
            }
        });
    }

    public closeComposeDialog(res): void {
        // this.resetComposeState();
        // this.dialogRef.close(res);
        this.closeDialogModel.emit(res);
    }

    private resetComposeState(): void {
        switch (this.data.composeType) {
            // case 'mail':
            //     this.rootStore.dispatch(generalActions.mailComposeState({ mailComposeOpenState: false }));
            //     break;
            // case 'campaign':
            //     this.rootStore.dispatch(generalActions.campaignComposeState({ campaignComposeOpenState: false }));
            //     break;
            default:
                break;
        }
    }

    /**
     * Show Compose Header Title
     *
     * @param {string} event
     * @memberof ComposeDialogComponent
     */
    public showComposeTitle(event: string) {
        this.composeTitle = event ? `- ${event}` : '';
    }

    public showFullScreen(): void {
        const doc = this.document.getElementsByTagName('body')[0];
        if (!doc.classList.contains('compose-full-screen')) {
            doc.classList.add('compose-full-screen');
        } else {
            doc.classList.remove('compose-full-screen');
        }
    }

    public exitFullScreen(): void {
        const doc = this.document.getElementsByTagName('body')[0];
        if (doc.classList.contains('compose-full-screen')) {
            doc.classList.remove('compose-full-screen');
        }
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes?.minimizeMailCompose?.currentValue) {
            this.exitFullScreen();
            setTimeout(() => {
                this.fullScreenMailComposeValue.emit(false);
            }, 0);
        }
    }
}
