import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoRecordFoundComponent } from '@proxy/ui/no-record-found';
import { MatPaginatorGotoComponent } from '@proxy/ui/mat-paginator-goto';
import { SearchComponent } from '@proxy/ui/search';
import { SkeletonDirective } from '@proxy/directives/skeleton';
import { LoaderComponent } from '@proxy/ui/loader';
import { CopyButtonComponent } from '@proxy/ui/copy-button';
import { BaseComponent } from '@proxy/ui/base-component';
import { PAGE_SIZE_OPTIONS } from '@proxy/constant';
import { omit } from 'lodash-es';
import { PageEvent } from '@angular/material/paginator';
import { FeatureComponentStore } from './feature.store';
import { Observable } from 'rxjs';
import { IFeature } from '@proxy/models/features-model';
import { IPaginatedResponse } from '@proxy/models/root-models';
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'proxy-features',
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatIconModule,
        MatTableModule,
        MatStepperModule,
        MatListModule,
        MatTooltipModule,
        NoRecordFoundComponent,
        MatPaginatorGotoComponent,
        SearchComponent,
        SkeletonDirective,
        LoaderComponent,
        CopyButtonComponent,
    ],
    templateUrl: './feature.component.html',
    styleUrls: ['./feature.component.scss'],
    providers: [FeatureComponentStore],
})
export class FeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    private componentStore = inject(FeatureComponentStore);
    private router = inject(Router);

    /** Store Feature Data */
    public feature$: Observable<IPaginatedResponse<IFeature[]>> = this.componentStore.feature$;
    /** Store current API Inprogress State */
    public loading$: Observable<{ [key: string]: boolean }> = this.componentStore.loading$;
    /** User has created any feature or not */
    public hasSomeFeatures$: Observable<boolean> = this.componentStore.hasSomeFeatures$;
    /** Store display column */
    public displayedColumns: string[] = ['name', 'reference_id', 'method', 'type', 'manage'];
    /** Params for fetching feature data */
    public params: any = {};
    /** Store page size option */
    public pageSizeOptions = PAGE_SIZE_OPTIONS;

    ngOnInit(): void {
        this.getFeatures();
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    /**
     *  Search by searchKeyword
     * @param searchKeyword
     */
    public search(searchKeyword: string) {
        if (searchKeyword?.length) {
            this.params = {
                ...this.params,
                search: searchKeyword.trim(),
            };
        } else {
            this.params = { ...omit(this.params, ['search']) };
        }
        this.params.pageNo = 1;
        this.getFeatures();
    }

    /**
     * Handle Page Changes
     * @param event
     */
    public pageChange(event: PageEvent): void {
        this.params = {
            ...this.params,
            pageNo: event.pageIndex + 1,
            itemsPerPage: event.pageSize,
        };
        this.getFeatures();
    }

    /**
     * Get Feature
     */
    public getFeatures(): void {
        this.componentStore.getFeature({ ...this.params });
    }

    public navigateToPreview(referenceId: string): void {
        this.router.navigate(['/widget-preview', referenceId], {
            state: { originUrl: this.router.url },
        });
    }
}
