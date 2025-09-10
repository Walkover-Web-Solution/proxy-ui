import { ActivatedRoute } from '@angular/router';
import { cloneDeep, isEqual } from 'lodash-es';
import { Component, OnDestroy, OnInit, NgZone, ViewChildren, QueryList } from '@angular/core';
import { BaseComponent } from '@proxy/ui/base-component';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, of, take, takeUntil } from 'rxjs';
import { CreateFeatureComponentStore } from './create-feature.store';
import {
    FeatureFieldType,
    IFeature,
    IFeatureDetails,
    IFeatureType,
    IFieldConfig,
    IMethod,
    IMethodService,
    ProxyAuthScript,
    ProxyAuthScriptUrl,
} from '@proxy/models/features-model';
import { FormArray, FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { CAMPAIGN_NAME_REGEX, ONLY_INTEGER_REGEX } from '@proxy/regex';
import { CustomValidators } from '@proxy/custom-validator';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { environment } from '../../../environments/environment';
import { PrimeNgToastService } from '@proxy/ui/prime-ng-toast';
import { MatStepper } from '@angular/material/stepper';
import { MatDialog } from '@angular/material/dialog';
import { getAcceptedTypeRegex } from '@proxy/utils';
import { SimpleDialogComponent } from './simple-dialog/simple-dialog.component';

type ServiceFormGroup = FormGroup<{
    requirements: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    configurations: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    is_enable: FormControl<boolean>;
    createPlanForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
    chargesForm: FormGroup<{
        [key: string]: FormControl<any>;
    }>;
}>;

export interface PeriodicElement {
    name: string;
    position: number;
    weight: number;
    symbol: string;
    type?: string;
    aggregation?: string;
    code?: string;
}
@Component({
    selector: 'proxy-create-feature',
    templateUrl: './create-feature.component.html',
    styleUrls: ['./create-feature.component.scss'],
    providers: [CreateFeatureComponentStore],
})
export class CreateFeatureComponent extends BaseComponent implements OnDestroy, OnInit {
    @ViewChildren('stepper') stepper: QueryList<MatStepper>;
    public taxes: any = {
        'data': {
            'taxes': [
                {
                    'lago_id': '441b1269-89e5-41ae-b229-66da1df1571e',
                    'name': 'GST 18',
                    'code': 'gst_18',
                    'rate': 18,
                    'description': 'GST with 18 percent rate.',
                    'applied_to_organization': false,
                    'add_ons_count': 0,
                    'customers_count': 0,
                    'plans_count': 0,
                    'charges_count': 0,
                    'commitments_count': 0,
                    'created_at': '2025-08-29T12:09:07Z',
                },
            ],
            'meta': {
                'current_page': 1,
                'next_page': null,
                'prev_page': null,
                'total_pages': 1,
                'total_count': 1,
            },
        },
        'status': 'success',
        'hasError': false,
        'errors': [],
        'proxy_duration': 545,
    };
    public blliableMetricList: any = [
        {
            'lago_id': '5ce242d4-54d3-4cd6-b623-dc6997ecced5',
            'name': 'ViaSocket Credits',
            'code': 'viasocket_credits',
            'description': 'Number of ViaSocket Credits',
            'aggregation_type': 'sum_agg',
            'weighted_interval': null,
            'recurring': false,
            'rounding_function': null,
            'rounding_precision': null,
            'created_at': '2025-09-03T11:45:50Z',
            'field_name': 'credits',
            'expression': null,
            'active_subscriptions_count': 0,
            'draft_invoices_count': 0,
            'plans_count': 0,
            'filters': [],
        },
        {
            'lago_id': '078c7925-a420-4c63-aa42-8206b994c814',
            'name': 'Storage',
            'code': 'storage',
            'description': '',
            'aggregation_type': 'sum_agg',
            'weighted_interval': null,
            'recurring': true,
            'rounding_function': null,
            'rounding_precision': null,
            'created_at': '2025-09-01T12:54:47Z',
            'field_name': 'GB',
            'expression': null,
            'active_subscriptions_count': 0,
            'draft_invoices_count': 0,
            'plans_count': 0,
            'filters': [],
        },
    ];

    public createPlanForm: any = {
        'name': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Name',
            'value_type': 'string',
            'type': 'text',
            'regex': '^.{1,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'code': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Code',
            'value_type': 'string',
            'type': 'text',
            'regex': '^[a-z0-9_]{1,255}$',
            'unique': true,
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'description': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Description',
            'value_type': 'string',
            'type': 'textarea',
            'regex': '^.{0,500}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'interval': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Interval',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(monthly|yearly|weekly|quarterly)$',
            'source': '',
            'sourceFieldLabel': ['Monthly', 'Yearly', 'Weekly', 'Quarterly'],
            'sourceFieldValue': ['monthly', 'yearly', 'weekly', 'quarterly'],
            'value': '',
        },
        'amount_cents': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Plan Price',
            'value_type': 'integer',
            'type': 'number',
            'regex': '^[0-9]+$',
            'source': [],
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': 0,
        },
        'amount_currency': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Currency',
            'value_type': 'string',
            'type': 'select',
            'regex': '^[A-Z]{3}$',
            'source': [
                'AED',
                'AFN',
                'ALL',
                'AMD',
                'ANG',
                'AOA',
                'ARS',
                'AUD',
                'AWG',
                'AZN',
                'BAM',
                'BBD',
                'BDT',
                'BGN',
                'BIF',
                'BMD',
                'BND',
                'BOB',
                'BRL',
                'BSD',
                'BWP',
                'BYN',
                'BZD',
                'CAD',
                'CDF',
                'CHF',
                'CLF',
                'CLP',
                'CNY',
                'COP',
                'CRC',
                'CVE',
                'CZK',
                'DJF',
                'DKK',
                'DOP',
                'DZD',
                'EGP',
                'ETB',
                'EUR',
                'FJD',
                'FKP',
                'GBP',
                'GEL',
                'GHS',
                'GIP',
                'GMD',
                'GNF',
                'GTQ',
                'GYD',
                'HKD',
                'HNL',
                'HRK',
                'HTG',
                'HUF',
                'IDR',
                'ILS',
                'INR',
                'ISK',
                'JMD',
                'JPY',
                'KES',
                'KGS',
                'KHR',
                'KMF',
                'KRW',
                'KYD',
                'KZT',
                'LAK',
                'LBP',
                'LKR',
                'LRD',
                'LSL',
                'MAD',
                'MDL',
                'MGA',
                'MKD',
                'MMK',
                'MNT',
                'MOP',
                'MRO',
                'MUR',
                'MVR',
                'MWK',
                'MXN',
                'MYR',
                'MZN',
                'NAD',
                'NGN',
                'NIO',
                'NOK',
                'NPR',
                'NZD',
                'PAB',
                'PEN',
                'PGK',
                'PHP',
                'PKR',
                'PLN',
                'PYG',
                'QAR',
                'RON',
                'RSD',
                'RUB',
                'RWF',
                'SAR',
                'SBD',
                'SCR',
                'SEK',
                'SGD',
                'SHP',
                'SLL',
                'SOS',
                'SRD',
                'STD',
                'SZL',
                'THB',
                'TJS',
                'TOP',
                'TRY',
                'TTD',
                'TWD',
                'TZS',
                'UAH',
                'UGX',
                'USD',
                'UYU',
                'UZS',
                'VND',
                'VUV',
                'WST',
                'XAF',
                'XCD',
                'XOF',
                'XPF',
                'YER',
                'ZAR',
                'ZMW',
            ],
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'trial_period': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Trial Period (days)',
            'value_type': 'integer',
            'type': 'number',
            'regex': '^[0-9]{1,3}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': 0,
        },
        'pay_in_advance': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Pay in Advance',
            'value_type': 'boolean',
            'type': 'select',
            'regex': '^(true|false)$',
            'source': '',
            'sourceFieldLabel': ['Yes', 'No'],
            'sourceFieldValue': [true, false],
            'value': false,
        },
        'tax_codes': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Tax Codes',
            'value_type': 'array',
            'type': 'select',
            'regex': '^[a-zA-Z0-9_\\-]+$',
            'source': 'https://apitest.msg91.com/api/subscription/{{ref_id}}/taxes',
            'sourceFieldLabel': 'name',
            'sourceFieldValue': 'code',
            'value': [],
        },
        'billable_metric_code': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Billable Metric',
            'value_type': 'string',
            'type': 'select',
            'regex': '^[a-z0-9_]{1,255}$',
            'source': 'https://apitest.msg91.com/api/subscription/{{ref_id}}/billable-metrics',
            'sourceFieldLabel': 'name',
            'sourceFieldValue': 'code',
            'value': '',
        },
        'charge_model': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Charge Model',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(standard)$',
            'source': '',
            'sourceFieldLabel': ['Standard'],
            'sourceFieldValue': ['standard'],
            'value': '',
        },
        'min_amount_cents': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Amount',
            'value_type': 'integer',
            'type': 'number',
            'regex': '^[0-9]+$',
            'source': [],
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': 0,
        },
    };
    public billableMetricForm: any = {
        'name': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Name',
            'value_type': 'string',
            'type': 'text',
            'regex': '^.{1,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'code': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Code',
            'value_type': 'string',
            'type': 'text',
            'regex': '^[a-z0-9_]{1,255}$',
            'unique': true,
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'description': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Description',
            'value_type': 'string',
            'type': 'textarea',
            'regex': '^.{0,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
        'recurring': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Metered or Recurring',
            'value_type': 'boolean',
            'type': 'select',
            'regex': '',
            'source': '',
            'sourceFieldLabel': ['Metered', 'Recurring'],
            'sourceFieldValue': [false, true],
            'value': '',
        },
        'aggregation_type': {
            'is_required': true,
            'is_hidden': false,
            'has_default': false,
            'label': 'Aggregation Type',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(count_agg|sum_agg|max_agg|unique_count_agg|weighted_sum_agg|latest_agg)$',
            'source': '/api/aggregation-types',
            'sourceFieldLabel': ['Count', 'Sum', 'Max', 'Unique Count', 'Weighted Sum', 'Latest'],
            'sourceFieldValue': [
                'count_agg',
                'sum_agg',
                'max_agg',
                'unique_count_agg',
                'weighted_sum_agg',
                'latest_agg',
            ],
            'value': '',
            'filter_conditions': [
                {
                    'when': {
                        'field': 'recurring',
                        'equals': false,
                    },
                    'hide': false,
                    'allowed_values': [
                        'count_agg',
                        'sum_agg',
                        'max_agg',
                        'unique_count_agg',
                        'weighted_sum_agg',
                        'latest_agg',
                    ],
                },
                {
                    'when': {
                        'field': 'recurring',
                        'equals': true,
                    },
                    'hide': false,
                    'allowed_values': ['count_agg', 'sum_agg', 'weighted_sum_agg'],
                },
            ],
        },
        'field_name': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Field Name',
            'value_type': 'string',
            'type': 'text',
            'regex': '^.{0,255}$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
            'filter_conditions': [
                {
                    'when': {
                        'field': 'aggregation_type',
                        'equals': 'sum_agg|max_agg|unique_count_agg|weighted_sum_agg|latest_agg',
                    },
                    'hide': false,
                },
                {
                    'when': {
                        'field': 'aggregation_type',
                        'equals': 'count_agg',
                    },
                    'hide': true,
                },
            ],
        },
        'rounding_function': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Rounding Function',
            'value_type': 'string',
            'type': 'select',
            'regex': '^(round|ceil|floor)?$',
            'source': '',
            'sourceFieldLabel': ['Round', 'Ceil', 'Floor'],
            'sourceFieldValue': ['round', 'ceil', 'floor'],
            'value': '',
        },
        'rounding_precision': {
            'is_required': false,
            'is_hidden': false,
            'has_default': false,
            'label': 'Rounding Precision',
            'value_type': 'integer',
            'type': 'number',
            'regex': '^[0-9]+$',
            'source': '',
            'sourceFieldLabel': '',
            'sourceFieldValue': '',
            'value': '',
        },
    };

    public dummyData = {
        'id': 4,
        'name': 'Subscription',
        'service_use': 'multiple',
        'icon': 'none',
        'method_services': [
            {
                'name': 'Lago Billing',
                'method_id': 4,
                'service_id': 10,
                'configurations': {
                    'fields': {
                        'redirect_uri': {
                            'type': 'text',
                            'label': 'Redirect URL',
                            'regex': '^(http?|https):\\/\\/[^\\s$.?#].[^\\s]*$',
                            'value': '',
                            'source': '',
                            'is_hidden': false,
                            'value_type': 'url',
                            'is_required': false,
                            'sourceFieldLabel': 'name',
                            'sourceFieldValue': 'name',
                        },
                    },
                    'mappings': [],
                },
                'requirements': {
                    'api_key': {
                        'type': 'text',
                        'label': 'API Key',
                        'regex': '^[^\\s]*$',
                        'value': '',
                        'source': '',
                        'is_hidden': false,
                        'value_type': 'string',
                        'has_default': false,
                        'is_required': true,
                        'sourceFieldLabel': 'name',
                        'sourceFieldValue': 'name',
                    },
                    'instance_url': {
                        'type': 'text',
                        'label': 'Instance URL',
                        'regex': '^https?:\\/\\/(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(?:\\/[^\\s]*)?$/',
                        'value': '',
                        'source': '',
                        'is_hidden': false,
                        'value_type': 'url',
                        'has_default': false,
                        'is_required': true,
                        'sourceFieldLabel': 'name',
                        'sourceFieldValue': 'name',
                    },
                    'stripe_secret_key': {
                        'type': 'text',
                        'label': 'API Key',
                        'regex': '^[^\\s]*$',
                        'value': '',
                        'source': '',
                        'is_hidden': false,
                        'value_type': 'string',
                        'has_default': false,
                        'is_required': true,
                        'sourceFieldLabel': 'name',
                        'sourceFieldValue': 'name',
                    },
                },
            },
        ],
        'authorization_format': {
            'format': {
                'company': {
                    'id': "_COMPANY['id']",
                    'name': "_COMPANY['name']",
                    'email': "_COMPANY['email']",
                    'mobile': "_COMPANY['mobile']",
                    'timezone': "_COMPANY['timezone']",
                },
                'user': {
                    'id': "_USER['id']",
                    'name': "_USER['name']",
                    'email': "_USER['email']",
                    'mobile': "_USER['mobile']",
                },
                'ip': '_IP',
            },
            'encode_type': 'JWT',
            'key': 'Authorization',
        },
    };

    public ELEMENT_DATA: PeriodicElement[] = [
        {
            position: 1,
            name: 'API Calls',
            weight: 0,
            symbol: 'api_calls',
            type: 'Metered',
            aggregation: 'Count',
            code: 'api_calls',
        },
        {
            position: 2,
            name: 'Data Storage',
            weight: 0,
            symbol: 'data_storage',
            type: 'Metered',
            aggregation: 'Sum',
            code: 'data_storage',
        },
        {
            position: 3,
            name: 'Monthly Subscription',
            weight: 0,
            symbol: 'monthly_sub',
            type: 'Recurring',
            aggregation: 'Count',
            code: 'monthly_sub',
        },
        {
            position: 4,
            name: 'Bandwidth Usage',
            weight: 0,
            symbol: 'bandwidth',
            type: 'Metered',
            aggregation: 'Sum',
            code: 'bandwidth',
        },
        {
            position: 5,
            name: 'Active Users',
            weight: 0,
            symbol: 'active_users',
            type: 'Metered',
            aggregation: 'Unique Count',
            code: 'active_users',
        },
        {
            position: 6,
            name: 'Premium Features',
            weight: 0,
            symbol: 'premium_features',
            type: 'Recurring',
            aggregation: 'Weighted Sum',
            code: 'premium_features',
        },
        {
            position: 7,
            name: 'File Uploads',
            weight: 0,
            symbol: 'file_uploads',
            type: 'Metered',
            aggregation: 'Count',
            code: 'file_uploads',
        },
        {
            position: 8,
            name: 'Database Queries',
            weight: 0,
            symbol: 'db_queries',
            type: 'Metered',
            aggregation: 'Sum',
            code: 'db_queries',
        },
    ];
    public displayedColumns: string[] = ['name', 'code', 'type', 'aggregation', 'action'];
    public dataSource = this.ELEMENT_DATA;
    public pageSizeOptions: number[] = [5, 10, 25, 100];

    // Charges table properties
    public chargesList: any[] = [];
    public chargesDisplayedColumns: string[] = ['metric', 'model', 'minAmount', 'actions'];

    public isLoading$: Observable<boolean> = this.componentStore.isLoading$;
    public featureType$: Observable<IFeatureType[]> = this.componentStore.featureType$;
    public serviceMethods$: Observable<IMethod[]> = this.componentStore.serviceMethods$;
    public createUpdateObject$: Observable<IFeature> = this.componentStore.createUpdateObject$;
    public featureDetails$: Observable<IFeatureDetails> = this.componentStore.featureDetails$;

    public isEditMode = false;
    public selectedServiceIndex = 0;
    public selectedMethod = new BehaviorSubject<IMethod>(null);
    public featureId: number = null;
    public nameFieldEditMode = false;
    public loadingScript = new BehaviorSubject<boolean>(false);
    public scriptLoaded = new BehaviorSubject<boolean>(false);
    public showApiConfigurationErrors = false;

    public featureFieldType = FeatureFieldType;
    public proxyAuthScript = ProxyAuthScript(environment.proxyServer);

    // Chip list
    public chipListSeparatorKeysCodes: number[] = [ENTER, COMMA];
    public chipListValues: { [key: string]: Set<string> } = {};
    public chipListReadOnlyValues: { [key: string]: Set<string> } = {};

    // File
    public fileValues: { [key: string]: FileList } = {};

    // Options cache for select fields
    private optionsCache: { [key: string]: any[] } = {};

    public featureForm = new FormGroup({
        primaryDetails: new FormGroup({
            name: new FormControl<string>(null, [
                Validators.required,
                Validators.pattern(CAMPAIGN_NAME_REGEX),
                CustomValidators.minLengthThreeWithoutSpace,
                CustomValidators.noStartEndSpaces,
                Validators.maxLength(60),
            ]),
            feature_id: new FormControl<number>(null, [Validators.required]),
            method_id: new FormControl<number>(null, [Validators.required]),
        }),
        serviceDetails: new FormArray<ServiceFormGroup>([]),
        authorizationDetails: new FormGroup({
            session_time: new FormControl<number>(null, [
                Validators.required,
                Validators.pattern(ONLY_INTEGER_REGEX),
                Validators.min(60),
                Validators.max(999999999),
            ]),
            authorizationKey: new FormControl<string>(null, [
                Validators.required,
                CustomValidators.minLengthThreeWithoutSpace,
            ]),
        }),
        // New form controls for conditional steps
        integrationChoice: new FormGroup({
            integrationType: new FormControl<string>(null, [Validators.required]),
        }),
        organizationDetails: new FormGroup({
            legalName: new FormControl<string>(null),
            legalNumber: new FormControl<string>(null),
            taxId: new FormControl<string>(null),
            email: new FormControl<string>(null),
            addressLine1: new FormControl<string>(null),
            addressLine2: new FormControl<string>(null),
            city: new FormControl<string>(null),
            state: new FormControl<string>(null),
            country: new FormControl<string>(null),
            postalCode: new FormControl<string>(null),
            phone: new FormControl<string>(null),
        }),
        billableMetrics: new FormGroup({
            apiCalls: new FormControl<boolean>(false),
            dataStorage: new FormControl<boolean>(false),
        }),
        createPlan: new FormGroup({
            planName: new FormControl<string>(null, [Validators.required]),
            price: new FormControl<number>(null, [Validators.required, Validators.min(0)]),
        }),
        plansOverview: new FormGroup({
            planSelected: new FormControl<string>(null, [Validators.required]),
        }),
    });
    public demoDiv$: Observable<string> = of(null);
    public keepOrder = () => 0;
    constructor(
        private componentStore: CreateFeatureComponentStore,
        private activatedRoute: ActivatedRoute,
        private toast: PrimeNgToastService,
        private ngZone: NgZone,
        private dialog: MatDialog
    ) {
        super();
    }

    ngOnInit(): void {
        this.activatedRoute.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (params?.id) {
                this.featureId = params.id;
                this.isEditMode = true;
                this.getFeatureDetalis();
            } else {
                this.getFeatureType();
            }
        });

        if (!this.isEditMode) {
            this.featureType$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((features) => {
                this.featureForm.get('primaryDetails.feature_id').setValue(features[0].id);
                if (features?.length === 1) {
                    this.stepper?.first?.next();
                }
            });
            // Selecting first method because there is no form for `method_id` selection currently
            this.serviceMethods$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((methods) => {
                this.featureForm.get('primaryDetails.method_id').setValue(methods[0].id);
            });
        } else {
            this.featureDetails$
                .pipe(
                    filter(Boolean),
                    distinctUntilChanged(
                        (previous, current) =>
                            previous.feature_id === current.feature_id && previous.reference_id === current.reference_id
                    ),
                    takeUntil(this.destroy$)
                )
                .subscribe((feature) => {
                    this.getServiceMethods(feature.feature_id);
                    this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, feature.reference_id);
                    this.demoDiv$ = of(`<div id="${feature.reference_id}"></div>`);
                });
            this.featureDetails$
                .pipe(filter(Boolean), distinctUntilChanged(isEqual), takeUntil(this.destroy$))
                .subscribe((feature) => {
                    this.serviceMethods$.pipe(filter(Boolean), take(1)).subscribe(() => {
                        this.featureForm.patchValue({
                            primaryDetails: {
                                name: feature.name,
                                feature_id: feature.feature_id,
                                method_id: feature.method_id,
                            },
                            authorizationDetails: {
                                session_time: feature.session_time,
                                authorizationKey: feature.authorization_format.key,
                            },
                        });
                    });
                });
        }
        this.featureForm
            .get('primaryDetails.method_id')
            .valueChanges.pipe(filter(Boolean), takeUntil(this.destroy$))
            .subscribe((id) => {
                const methods: IMethod[] = this.getValueFromObservable(this.serviceMethods$);
                this.selectedMethod.next(methods.find((method) => method.id === id));
            });
        this.selectedMethod.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((method) => {
            this.featureForm.controls.serviceDetails.clear();
            const featureDetails: IFeatureDetails = this.getValueFromObservable(this.featureDetails$);
            method.method_services.forEach((service, index) => {
                const serviceValues = featureDetails?.service_configurations?.[service?.service_id];
                const serviceFormGroup: ServiceFormGroup = new FormGroup({
                    requirements: new FormGroup({}),
                    configurations: new FormGroup({}),
                    createPlanForm: new FormGroup({}),
                    chargesForm: new FormGroup({}),
                    is_enable: new FormControl<boolean>(this.isEditMode ? serviceValues?.is_enable : true),
                });
                if (service.requirements) {
                    Object.entries(service.requirements).forEach(([key, config]) => {
                        const formControl = this.createFormControl(
                            config,
                            index,
                            this.isEditMode ? serviceValues?.requirements?.[key]?.value : null
                        );
                        if (formControl) {
                            serviceFormGroup.controls.requirements.addControl(key, formControl);
                        }
                    });
                    Object.entries(service.configurations.fields).forEach(([key, config]) => {
                        const formControl = this.createFormControl(
                            config,
                            index,
                            this.isEditMode ? serviceValues?.configurations?.fields?.[key]?.value : null
                        );
                        if (formControl) {
                            serviceFormGroup.controls.configurations.addControl(key, formControl);
                        }
                    });
                    // Get all keys except the last 3
                    const allKeys = Object.keys(this.createPlanForm);
                    const keysToInclude = allKeys.slice(0, -3);

                    keysToInclude.forEach((key) => {
                        const config = this.createPlanForm[key];
                        const formControl = this.createFormControl(config as IFieldConfig, index, null);
                        if (formControl) {
                            serviceFormGroup.controls.createPlanForm.addControl(key, formControl);
                        }
                    });

                    // Add the last 3 keys
                    const lastKeys = allKeys.slice(-3);
                    lastKeys.forEach((key) => {
                        const config = this.createPlanForm[key];
                        const formControl = this.createFormControl(config as IFieldConfig, index, null);
                        if (formControl) {
                            serviceFormGroup.controls.chargesForm.addControl(key, formControl);
                        }
                    });
                }
                console.log(this.createPlanForm);
                console.log(serviceFormGroup);
                this.featureForm.controls.serviceDetails.push(serviceFormGroup);
            });
        });
        this.createUpdateObject$.pipe(filter(Boolean), takeUntil(this.destroy$)).subscribe((obj) => {
            this.proxyAuthScript = ProxyAuthScript(environment.proxyServer, obj.reference_id);
            if (this.isEditMode) {
                this.nameFieldEditMode = false;
                this.getFeatureDetalis();
            } else {
                setTimeout(() => {
                    this.stepper?.first?.next();
                }, 10);
            }
        });
    }

    public createFeature() {
        if (this.featureForm.controls.authorizationDetails.invalid) {
            this.featureForm.controls.authorizationDetails.markAllAsTouched();
        } else {
            const selectedMethod = cloneDeep(this.selectedMethod.getValue());
            const featureFormData = this.featureForm.value;
            const payload = {
                ...featureFormData.primaryDetails,
                authorization_format: {
                    ...selectedMethod.authorization_format,
                    key: featureFormData.authorizationDetails.authorizationKey,
                },
                session_time: featureFormData.authorizationDetails.session_time,
                services: this.getServicePayload(selectedMethod),
            };
            // Added setTimeout because payload creation might contain promises
            setTimeout(() => {
                this.componentStore.createFeature(payload);
            }, 100);
        }
    }

    public updateFeature(type: 'name' | 'service' | 'authorization') {
        let payload;
        const selectedMethod = cloneDeep(this.selectedMethod.getValue());
        const featureDetails: IFeatureDetails = this.getValueFromObservable(this.featureDetails$);
        switch (type) {
            case 'name':
                const primaryDetailsForm = this.featureForm.controls.primaryDetails;
                if (primaryDetailsForm.valid) {
                    payload = {
                        name: primaryDetailsForm.value.name,
                    };
                } else {
                    primaryDetailsForm.markAllAsTouched();
                    return;
                }
                break;
            case 'authorization':
                const authorizationDetailsForm = this.featureForm.controls.authorizationDetails;
                if (authorizationDetailsForm.valid) {
                    payload = {
                        authorization_format: {
                            ...featureDetails.authorization_format,
                            key: authorizationDetailsForm.value.authorizationKey,
                        },
                        session_time: authorizationDetailsForm.value.session_time,
                    };
                } else {
                    authorizationDetailsForm.markAllAsTouched();
                    return;
                }
                break;
            case 'service':
                if (this.isConfigureMethodValid) {
                    payload = {
                        services: this.getServicePayload(selectedMethod),
                    };
                } else {
                    this.markDirtyServiceFormTouched();
                    return;
                }
                break;
            default:
                payload = {};
                break;
        }
        // Added setTimeout because payload creation might contain promises
        setTimeout(() => {
            this.componentStore.updateFeature({ id: this.featureId, body: payload });
        }, 100);
    }

    private getServicePayload(selectedMethod: IMethod): IMethodService[] {
        const services = [];
        this.featureForm.controls.serviceDetails.controls.forEach((formGroup, index) => {
            if (formGroup.dirty) {
                const service = selectedMethod.method_services[index];
                const formData = formGroup.value;
                this.setFormDataInPayload(service?.requirements, formData.requirements, index);
                this.setFormDataInPayload(service?.configurations?.fields, formData.configurations, index);
                service['is_enable'] = formData.is_enable;
                services.push(service);
            }
        });
        return services;
    }

    private setFormDataInPayload(
        payloadObject: { [key: string]: IFieldConfig },
        formDataObject: { [key: string]: any },
        index: number
    ): void {
        Object.keys(payloadObject ?? {}).forEach((key) => {
            const config = payloadObject[key];
            const promise = this.getValueOtherThanForm(config, index);
            if (promise) {
                promise.then((value) => (config.value = value ?? null));
            } else {
                config.value = formDataObject?.[key];
            }
        });
    }

    public stepChange(event: any) {
        if (!this.isEditMode && event?.previouslySelectedIndex === 0) {
            this.getServiceMethods(this.featureForm.value.primaryDetails.feature_id);
        }
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public getServiceMethods(id: number): void {
        this.componentStore.getServiceMethods(id);
    }

    public getFeatureType() {
        this.componentStore.getFeatureType();
    }

    public getFeatureDetalis() {
        this.componentStore.getFeatureDetalis(this.featureId);
    }

    public getValueOtherThanForm(config: IFieldConfig, index: number): Promise<any> {
        const key = `${config.label}_${index}`;
        if (config.type === FeatureFieldType.ChipList) {
            return new Promise((resolve) =>
                resolve(Array.from(this.chipListValues[key]).join(config?.delimiter ?? ' '))
            );
        } else if (config.type === FeatureFieldType.ReadFile) {
            const file = this.fileValues[key]?.[0];
            if (file) {
                config['fileName'] = file?.name;
                return file?.text();
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public createFormControl(config: IFieldConfig, index: number, value: any = null) {
        if (!config.is_hidden) {
            const validators: ValidatorFn[] = [];
            let formValue = value ?? config.value;
            const key = `${config.label}_${index}`;
            if (config.type === FeatureFieldType.ChipList) {
                this.chipListValues[key] = new Set(formValue?.split(config.delimiter ?? ' ') ?? []);
                this.chipListReadOnlyValues[key] = new Set(config?.read_only_value ?? []);
                formValue = null;
            }
            if (config.type === FeatureFieldType.ReadFile) {
                this.fileValues[key] = null;
                if (config?.fileName) {
                    formValue = config?.fileName;
                }
            }
            if (config.is_required) {
                if (config.type === FeatureFieldType.ChipList) {
                    validators.push(CustomValidators.atleastOneValueInChipList(this.chipListValues[key]));
                } else {
                    validators.push(Validators.required);
                }
            }
            if (config.regex) {
                validators.push(Validators.pattern(config.regex));
            }
            return new FormControl<any>({ value: formValue, disabled: Boolean(config?.is_disable) }, validators);
        } else {
            return null;
        }
    }

    public get isConfigureMethodValid(): boolean {
        let isValid = true;
        const serviceFormArray = this.featureForm.controls.serviceDetails;
        serviceFormArray.controls.forEach((formGroup) => formGroup.dirty && formGroup.invalid && (isValid = false));
        return isValid && serviceFormArray.dirty;
    }
    public markDirtyServiceFormTouched(): void {
        const serviceFormArray = this.featureForm.controls.serviceDetails;
        serviceFormArray.controls.forEach(
            (formGroup, index) =>
                (formGroup.dirty || index === this.selectedServiceIndex) && formGroup.markAllAsTouched()
        );
    }

    public resetFormGroup(formGroup: FormGroup, index: number): void {
        formGroup.reset();
        Object.keys(this.chipListValues)
            .filter((key) => +key.split('_')[1] === index)
            .forEach((key) => (this.chipListValues[key] = new Set(this.chipListReadOnlyValues[key])));
        Object.keys(this.fileValues)
            .filter((key) => +key.split('_')[1] === index)
            .forEach((key) => (this.fileValues[key] = null));
    }

    public updateChipListValues(
        operation: 'add' | 'delete',
        chipListKey: string,
        fieldControl: FormControl,
        value: string
    ): void {
        if (operation === 'add') {
            if (fieldControl.valid && value) {
                this.chipListValues[chipListKey].add(value);
                fieldControl.reset();
            }
        } else if (operation === 'delete') {
            this.chipListValues[chipListKey].delete(value);
            fieldControl.updateValueAndValidity();
        }
    }

    public updateFileValue(
        fileKey: string,
        fieldConfig: IFieldConfig,
        fieldControl: FormControl,
        value: FileList
    ): void {
        if (value) {
            let fileRegex = null;
            const nameArray = [];
            if (fieldConfig?.allowed_types) {
                fileRegex = getAcceptedTypeRegex(fieldConfig?.allowed_types);
            }
            for (let i = 0; i < value.length; i++) {
                if (!fileRegex || this.isFileAllowed(value[i], fileRegex)) {
                    nameArray.push(value[i]?.name);
                } else {
                    setTimeout(() => {
                        fieldControl?.setErrors({
                            ...fieldControl?.errors,
                            customError: 'Selected file is not supported for ' + fieldConfig?.label,
                        });
                    }, 100);
                    value = null;
                    break;
                }
            }
            this.fileValues[fileKey] = value;
            fieldControl.setValue(nameArray.join(', '));
            fieldControl.markAsDirty();
            this.featureForm.markAsDirty();
        } else {
            this.fileValues[fileKey] = null;
            fieldControl.reset();
        }
    }

    private isFileAllowed(file: File, fileRegex: string): boolean {
        if (file?.type) {
            return Boolean(file?.type?.match(fileRegex));
        } else {
            const nameSplit = file?.name?.split('.');
            return Boolean(('.' + nameSplit[nameSplit?.length - 1])?.match(fileRegex));
        }
    }

    public addBillableMetric(): void {
        try {
            const dialogRef = this.dialog.open(SimpleDialogComponent, {
                width: '600px',
                height: 'auto',
                maxHeight: '90vh',
                autoFocus: false,
                restoreFocus: false,
                hasBackdrop: true,
                data: {
                    message: 'Add New Metric',
                    formConfig: this.billableMetricForm,
                },
            });
            dialogRef.afterClosed().subscribe((result) => {
                if (result) {
                    //    need to call the create api here
                    console.log(result);
                }
            });
        } catch (error) {
            console.error('Error opening dialog:', error);
        }
    }

    private addMetricToTable(metricData: any): void {
        // Add the new metric to the data source
        const newMetric: PeriodicElement = {
            position: this.ELEMENT_DATA.length + 1,
            name: metricData.name,
            weight: 0, // Default weight
            symbol: metricData.code || 'N/A',
            code: metricData.code || 'N/A',
            type: this.getTypeLabel(metricData.recurring),
            aggregation: this.getAggregationLabel(metricData.aggregation_type),
        };
        this.ELEMENT_DATA.push(newMetric);
        this.dataSource = [...this.ELEMENT_DATA];
    }

    private getTypeLabel(recurringValue: boolean): string {
        // Extract type mapping from form configuration dynamically
        const recurringConfig = this.billableMetricForm.recurring;
        if (recurringConfig.sourceFieldLabel && recurringConfig.sourceFieldValue) {
            const index = recurringConfig.sourceFieldValue.indexOf(recurringValue);
            return index !== -1 ? recurringConfig.sourceFieldLabel[index] : 'N/A';
        }
        return 'N/A';
    }

    public editMetric(metric: PeriodicElement, index: number): void {
        debugger;
        // Transform PeriodicElement data to match form configuration
        const editData = this.transformMetricToFormData(metric);

        const dialogRef = this.dialog.open(SimpleDialogComponent, {
            width: '600px',
            height: 'auto',
            maxHeight: '90vh',
            autoFocus: false,
            restoreFocus: false,
            hasBackdrop: true,
            data: {
                message: 'Edit Metric',
                formConfig: this.billableMetricForm,
                dialogTitle: 'Edit Metric',
                submitButtonText: 'Update Metric',
                editData: editData, // Pass transformed data for editing
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.updateMetricInTable(result, index);
            }
        });
    }

    public deleteMetric(index: number): void {
        // need to call the delete api here
        console.log(index);
    }

    private updateMetricInTable(metricData: any, index: number): void {
        // need to call the update api
        console.log(index);
    }

    private getAggregationLabel(aggregationType: string): string {
        // Extract aggregation mapping from form configuration dynamically
        const aggregationConfig = this.billableMetricForm.aggregation_type;
        if (aggregationConfig.sourceFieldLabel && aggregationConfig.sourceFieldValue) {
            const index = aggregationConfig.sourceFieldValue.indexOf(aggregationType);
            return index !== -1 ? aggregationConfig.sourceFieldLabel[index] : 'N/A';
        }
        return 'N/A';
    }

    private transformMetricToFormData(metric: PeriodicElement): any {
        // Dynamic field mapping configuration
        const fieldMappings = this.getFieldMappings();
        const formData: any = {};

        // Apply field mappings dynamically
        Object.keys(fieldMappings).forEach((formField) => {
            const mapping = fieldMappings[formField];
            if (mapping.directField && metric[mapping.directField] !== undefined) {
                formData[formField] = metric[mapping.directField];
            } else if (mapping.transformFunction) {
                formData[formField] = mapping.transformFunction(metric);
            } else if (mapping.defaultValue !== undefined) {
                formData[formField] = mapping.defaultValue;
            }
        });

        return formData;
    }

    private getFieldMappings(): { [key: string]: any } {
        const mappings: { [key: string]: any } = {};

        // Dynamically extract keys from billableMetricForm
        Object.keys(this.billableMetricForm).forEach((key) => {
            const fieldConfig = this.billableMetricForm[key];

            // Determine mapping type based on field configuration
            if (this.shouldUseDirectField(fieldConfig)) {
                mappings[key] = { directField: key };
            } else if (this.shouldUseTransformFunction(fieldConfig)) {
                mappings[key] = this.getTransformFunction(key, fieldConfig);
            } else {
                mappings[key] = { defaultValue: this.getDefaultValue(fieldConfig) };
            }
        });

        return mappings;
    }

    private shouldUseDirectField(fieldConfig: any): boolean {
        // Use direct field for simple text fields that are required and have no special logic
        return (
            fieldConfig.type === 'text' &&
            fieldConfig.is_required === true &&
            !fieldConfig.source &&
            !fieldConfig.sourceFieldValue
        );
    }

    private shouldUseTransformFunction(fieldConfig: any): boolean {
        // Use transform function for fields with sourceFieldValue (select fields with mappings)
        return (
            fieldConfig.sourceFieldValue &&
            Array.isArray(fieldConfig.sourceFieldValue) &&
            fieldConfig.sourceFieldValue.length > 0
        );
    }

    private getTransformFunction(key: string, fieldConfig: any): any {
        // Create transform function based on field type
        if (key === 'recurring') {
            return {
                transformFunction: (metric: PeriodicElement) => {
                    const typeMapping = this.getTypeMapping();
                    return typeMapping[metric.type] !== undefined ? typeMapping[metric.type] : false;
                },
            };
        } else if (key === 'aggregation_type') {
            return {
                transformFunction: (metric: PeriodicElement) => {
                    const aggregationMapping = this.getAggregationMapping();
                    return aggregationMapping[metric.aggregation] || '';
                },
            };
        } else {
            // Generic transform function for other fields with sourceFieldValue
            return {
                transformFunction: (metric: PeriodicElement) => {
                    // You can extend this logic based on your specific needs
                    return fieldConfig.value || '';
                },
            };
        }
    }

    private getDefaultValue(fieldConfig: any): any {
        // Return appropriate default value based on field type
        if (fieldConfig.value_type === 'integer' || fieldConfig.value_type === 'number') {
            return 0;
        } else if (fieldConfig.value_type === 'boolean') {
            return false;
        } else {
            return '';
        }
    }

    private getTypeMapping(): { [key: string]: boolean } {
        // Extract type mapping from form configuration
        const recurringConfig = this.billableMetricForm.recurring;
        if (recurringConfig.sourceFieldLabel && recurringConfig.sourceFieldValue) {
            const mapping: { [key: string]: boolean } = {};
            recurringConfig.sourceFieldLabel.forEach((label: string, index: number) => {
                mapping[label] = recurringConfig.sourceFieldValue[index];
            });
            return mapping;
        }
        return { 'Metered': false, 'Recurring': true };
    }

    private getAggregationMapping(): { [key: string]: string } {
        // Extract aggregation mapping from form configuration
        const aggregationConfig = this.billableMetricForm.aggregation_type;
        if (aggregationConfig.sourceFieldLabel && aggregationConfig.sourceFieldValue) {
            const mapping: { [key: string]: string } = {};
            aggregationConfig.sourceFieldLabel.forEach((label: string, index: number) => {
                mapping[label] = aggregationConfig.sourceFieldValue[index];
            });
            return mapping;
        }
        return {};
    }

    // Charges table methods
    public addCharge(): void {
        // Get the current form values from chargesForm
        const serviceDetailsArray = this.featureForm.get('serviceDetails') as FormArray;
        const serviceForm = serviceDetailsArray?.at(this.selectedServiceIndex);
        if (serviceForm) {
            const chargesForm = serviceForm.get('chargesForm');

            // Add charge even if form is not completely valid, just check if we have some data
            const metricValue = chargesForm?.get('billable_metric_code')?.value;
            const modelValue = chargesForm?.get('charge_model')?.value;
            const amountValue = chargesForm?.get('min_amount_cents')?.value;

            if (metricValue || modelValue || amountValue) {
                const chargeData = {
                    metric: metricValue || 'N/A',
                    model: modelValue || 'N/A',
                    minAmount: this.formatAmount(amountValue || 0),
                };

                this.chargesList.push(chargeData);
                // Force change detection by creating a new array reference
                this.chargesList = [...this.chargesList];

                // Reset the form after adding
                chargesForm?.reset();
            }
        }
    }

    public removeCharge(index: number): void {
        this.chargesList.splice(index, 1);
        // Force change detection by creating a new array reference
        this.chargesList = [...this.chargesList];
    }

    private formatAmount(amountCents: number): string {
        return `$${(amountCents / 100).toFixed(2)}`;
    }

    public previewFeature(): void {
        const configuration = {
            referenceId:
                this.getValueFromObservable(this.createUpdateObject$)?.reference_id ??
                this.getValueFromObservable(this.featureDetails$)?.reference_id,
            target: '_blank',
            success: (data) => {
                // get verified token in response
                this.ngZone.run(() => {
                    this.toast.success('Authorization successfully completed');
                });
            },
            failure: (error) => {
                // handle error
                this.ngZone.run(() => {
                    this.toast.error(error?.message);
                });
            },
        };
        if (!this.scriptLoaded.getValue()) {
            this.loadingScript.next(true);
            const head = document.getElementsByTagName('head')[0];
            const currentTimestamp = new Date().getTime();
            const otpProviderScript = document.createElement('script');
            otpProviderScript.type = 'text/javascript';
            otpProviderScript.src = ProxyAuthScriptUrl(environment.proxyServer, currentTimestamp);
            head.appendChild(otpProviderScript);
            otpProviderScript.onload = () => {
                this.loadingScript.next(false);
                window?.['initVerification']?.(configuration);
            };
            this.scriptLoaded.next(true);
        } else {
            window?.['initVerification']?.(configuration);
        }
    }
    public getPlansForm(): void {
        const selectedMethod = cloneDeep(this.selectedMethod.getValue());
        const services = this.getServicePayload(selectedMethod);
        const featureFormData = this.featureForm.value;

        const originalService = selectedMethod?.method_services?.[0];

        const transformedObjects = this.mergeObjects(featureFormData, originalService);
        setTimeout(() => {
            this.componentStore.createFeature(transformedObjects);
        }, 100);
    }
    public mergeObjects(primaryObj: any, serviceObj: any) {
        return {
            name: primaryObj.primaryDetails?.name || serviceObj?.name || null,
            feature_id: primaryObj.primaryDetails?.feature_id || null,
            method_id: primaryObj.primaryDetails?.method_id || serviceObj?.method_id || null,
            services: [
                {
                    service_id: serviceObj?.service_id || null,
                    configurations: {
                        fields: Object.entries(primaryObj.serviceDetails?.[0]?.configurations || {}).reduce(
                            (acc: any, [key, value]: any) => {
                                acc[key] = { value };
                                return acc;
                            },
                            {}
                        ),
                        mappings: serviceObj?.configurations?.mappings || [],
                    },
                    requirements: primaryObj.serviceDetails?.[0]?.requirements || serviceObj?.requirements || {},
                },
            ],
        };
    }

    public getSelectOptions(fieldConfig: any): any[] {
        if (!fieldConfig?.label) {
            return [];
        }
        const cacheKey = this.getCacheKey(fieldConfig);
        if (this.optionsCache[cacheKey]) {
            return this.optionsCache[cacheKey];
        }

        let options: any[] = [];

        // Handle specific API fields
        if (fieldConfig.label === 'Tax Codes' || fieldConfig.label === 'Billable Metric') {
            options = this.getApiOptions(fieldConfig);
        }
        // Handle source as array (like currency codes)
        else if (fieldConfig.source && Array.isArray(fieldConfig.source)) {
            options = fieldConfig.source.map((value: string) => ({
                label: value,
                value: value,
            }));
        }
        // Handle sourceFieldLabel and sourceFieldValue arrays
        else if (
            fieldConfig.sourceFieldLabel &&
            fieldConfig.sourceFieldValue &&
            Array.isArray(fieldConfig.sourceFieldLabel) &&
            Array.isArray(fieldConfig.sourceFieldValue)
        ) {
            options = fieldConfig.sourceFieldLabel.map((label: string, index: number) => ({
                label: label,
                value: fieldConfig.sourceFieldValue[index],
            }));
        }
        // Handle regex patterns
        else if (fieldConfig.regex) {
            options = this.extractOptionsFromRegex(fieldConfig.regex);
        }

        if (fieldConfig.filter_conditions) {
            options = this.applyFilterConditions(fieldConfig, options);
        }

        this.optionsCache[cacheKey] = options;
        return options;
    }

    // Separate function for API calls
    private getApiOptions(fieldConfig: any): any[] {
        if (fieldConfig.label === 'Tax Codes') {
            return this.getTaxOptionsFromData();
        } else if (fieldConfig.label === 'Billable Metric') {
            return this.blliableMetricList.map((metric) => ({
                label: metric.name,
                value: metric.code,
            }));
        }

        return [];
    }

    private getTaxOptionsFromData(): any[] {
        // Extract tax options from the taxes API response data
        if (this.taxes && this.taxes.data && this.taxes.data.taxes) {
            return this.taxes.data.taxes.map((tax: any) => ({
                label: `${tax.name} (${tax.rate}%)`,
                value: tax.code,
                lago_id: tax.lago_id,
                rate: tax.rate,
                description: tax.description,
            }));
        }
        return [];
    }

    private extractOptionsFromRegex(regex: string): any[] {
        // Extract options from regex patterns like "^(option1|option2|option3)$"
        const match = regex.match(/\^\(([^)]+)\)\$/);
        if (match && match[1]) {
            const values = match[1].split('|');
            return values.map((value) => ({
                label: this.formatLabel(value),
                value: value,
            }));
        }

        // Handle optional patterns like "^(option1|option2)?$"
        const optionalMatch = regex.match(/\^\(([^)]+)\)\?\$/);
        if (optionalMatch && optionalMatch[1]) {
            const values = optionalMatch[1].split('|');
            return [
                { label: 'None', value: '' },
                ...values.map((value) => ({
                    label: this.formatLabel(value),
                    value: value,
                })),
            ];
        }

        return [];
    }

    private applyFilterConditions(fieldConfig: any, options: any[]): any[] {
        if (!fieldConfig.filter_conditions || !Array.isArray(fieldConfig.filter_conditions)) {
            return options;
        }
        for (const condition of fieldConfig.filter_conditions) {
            if (this.evaluateCondition(condition.when)) {
                if (condition.hide) {
                    return [];
                }
                if (condition.allowed_values) {
                    return options.filter((option) => condition.allowed_values.includes(option.value));
                }
                return options;
            }
        }

        return options;
    }

    private evaluateCondition(whenCondition: any): boolean {
        if (!whenCondition || !whenCondition.field) {
            return false;
        }

        const fieldValue = this.featureForm?.get(whenCondition.field)?.value;

        if (whenCondition.equals !== undefined) {
            // Handle single value comparison
            if (typeof whenCondition.equals === 'string' && whenCondition.equals.includes('|')) {
                // Handle multiple values separated by |
                const allowedValues = whenCondition.equals.split('|');
                return allowedValues.includes(fieldValue);
            }
            return fieldValue === whenCondition.equals;
        }

        return false;
    }

    private formatLabel(value: string): string {
        // Convert snake_case to Title Case
        return value
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    private getCacheKey(fieldConfig: any): string {
        let cacheKey = fieldConfig.label;

        // If field has filter conditions, include the current form values that affect it
        if (fieldConfig.filter_conditions) {
            const affectingValues: string[] = [];
            fieldConfig.filter_conditions.forEach((condition: any) => {
                if (condition.when?.field) {
                    const fieldValue = this.featureForm?.get(condition.when.field)?.value;
                    // Handle null/undefined values properly
                    const value = fieldValue !== null && fieldValue !== undefined ? fieldValue : 'null';
                    affectingValues.push(`${condition.when.field}:${value}`);
                }
            });
            if (affectingValues.length > 0) {
                cacheKey += `_${affectingValues.join('_')}`;
            }
        }

        return cacheKey;
    }
}
