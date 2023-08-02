import { ajax } from 'rxjs/ajax';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';

import { cloneDeep } from 'lodash-es';
export * from './drop-down';
export * from './mat-icon';
export * from './jitsi-calling';
export * from './permission-mapping';
export * from './verification';
export * from './moment';
export const IS_USER = 'i';
export const HELLO_REF_ID = 'h';
export const UNIQUE_ID = 'u';
export const CREATED_AT = 'c';
export const SIGNED_UP_AT = 's';
export const PAGE_SIZE_OPTIONS = [25, 50, 100];
export const SEGMENTO_PAGE_SIZE_OPTIONS = [100, 250, 500, 1000];
export const SHOW_PAGINATOR_LENGTH = 25;
export const SEGMENTO_SHOW_PAGINATOR_LENGTH = 99;
export const DEBOUNCE_TIME = 700;
export const DELAY_1000_MS = 1000;
export const SCROLL_DELAY = 100;
export const MAIL_COMPOSE_LOCAL_STORAGE = 'newComposeMail';
export const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEK_DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEK_DAYS_LESS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const YEAR_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const JS_START_DATE: Date = new Date('1970-01-01');
export const TODAY: Date = new Date();
export const TOMORROW_DAY = (new Date().getDay() + 1) % 7;
export const TODAY_DAY = TODAY.getDay();
export const NEXT_MONTH = (TODAY.getMonth() + 1) % 12;
export const TODAY_DATE: number = TODAY.getDate();
export const META_TAG_ID = 'meta-tag-id-proxy-otp-provider';
export const JITSI_SCRIPT_TAG_ID = 'jitsi-script-tag-proxy-video-call';
export const PROXY_WIDGET_HIDE_LAUNCHER_STATUS = 'PROXY_WIDGET_HIDE_LAUNCHER_STATUS';
export const OVER_USAGE_LIMIT_TOOLTIP =
    'Maximum amount deductable from wallet after free credits are exhausted in real-time';
export const separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
export const SPECIAL_CHARACTERS_TO_REMOVE: string[] = [
    '~',
    '!',
    '@',
    '#',
    '$',
    '%',
    '^',
    '&',
    '*',
    '(',
    ')',
    '_',
    '-',
    '+',
    '=',
    '£',
];

export const smsURLs: { sendSMS: string; report: string; phonebook: string; virtualNumber: string } = {
    // sendSMS: '/user/index.php#campaign/send_sms',
    sendSMS: '/user/index.php#developer/flow_dashboard',
    report: '/user/index.php#campaign/summary_report',
    phonebook: '/user/index.php#phone_book',
    virtualNumber: '/user/index.php#campaign/lci',
};

export enum socketPresenceListener {
    JoinChannel = 'JoinChannel',
    LeaveChannel = 'LeaveChannel',
    Typing = 'Typing',
    NotTyping = 'NotTyping',
}

export enum TelegramBotEvents {
    MakeABot = 'make-a-new-bot',
    HaveABot = 'already-have-a-bot',
    Update = 'update-integration-data',
    QR = 'qr-url-exists',
}

export enum socketCommunicationListener {
    MessageListener = 'NewPublish',
    SignalListener = 'PublishSignal',
    HereNow = 'HereNow',
}

export enum socketEvents {
    JoinChannel = 'join-channel',
    LeaveChannel = 'leave-channel',
    Typing = 'typing',
    NotTyping = 'not-typing',
    subscribe = 'subscribe',
    unsubscribe = 'unsubscribe',
    PublishSignal = 'publish-signal',
    HereNow = 'here-now',
    AddFCMToken = 'add-token-for-notification',
    RemoveFCMToken = 'remove-token-for-notification',
}

export const LINE_CHART_COLORS = [
    { 'name': 'Delivered', 'value': 'var(--color-whatsApp-primary)' },
    { 'name': 'Complaints', 'value': 'var(--color-email-primary)' },
    { 'name': 'Opened', 'value': 'var(--color-common-primary)' },
    { 'name': 'Bounced', 'value': 'var(--color-common-rock)' },
    { 'name': 'Unsubscribed', 'value': 'var(--color-common-rock)' },
    { 'name': 'Total', 'value': 'var(--color-common-primary)' },
    { 'name': 'In Progress', 'value': 'var(--color-short-url-primary)' },
    { 'name': 'Failed', 'value': 'var(--color-email-primary)' },
    { 'name': 'Other', 'value': 'var(--color-common-rock)' },
    { 'name': 'Suppressed', 'value': 'var(--color-short-url-primary)' },
];

export const INCLUDES_PUBLIC_ROUTES = (url: string): boolean => {
    return url.includes('/p/unsubscribe/') ||
        url.includes('/p/v2/unsubscribe/') ||
        url.includes('/p/feedback') ||
        url.includes('/p/thanks') ||
        url.includes('/p/email-template-reference') ||
        url.includes('/p/chat-widget-dummy') ||
        url.includes('/p/client-video-call') ||
        url.includes('/p/domain/verification')
        ? true
        : false;
};

/** Stores all the lazy loaded routes with their status
 * if the route has been loaded at least once.
 */
const LAZY_LOAD_ROUTES = new Map(
    Object.entries({
        'settings': false,
        'email': false,
        'rcs': false,
        'segmento': false,
        'campaigns': false,
        'hello': false,
        'whatsapp': false,
        'subscription': false,
        'voice': false,
        'shorturl': false,
        'otp': false,
        'sms': false,
        'reports': false,
        'files': false,
        'knowledgebase': false,
        'telegram': false,
        'notifications': false,
        'numbers': false,
    })
);

export const LAZY_LOAD_MODULES = (path: string, setPath?: boolean): boolean => {
    if (LAZY_LOAD_ROUTES.has(path) && !LAZY_LOAD_ROUTES.get(path)) {
        // The path is present and has value false, it means this route is reached for the first time
        if (setPath) {
            // Set the path to be visited to avoid showing of loading screen multiple times
            LAZY_LOAD_ROUTES.set(path, true);
        }
        return true;
    }
    return false;
};

export const SUPPORTED_CURRENCIES = {
    USD: '$',
    INR: '₹',
    GBP: '£',
};

export enum SelectDateRange {
    CurrentMonth,
    PreviousMonth,
    CurrentQuarter,
    PreviousQuarter,
}

export enum ReportMicroServiceTypeEnums {
    SMS = 'sms',
    OTP = 'otp',
    Email = 'mail',
    Whatsapp = 'wa',
    DLT = 'dlt',
    ShortURL = 'SHORT_URL',
    Numbers = 'numbers',
    Voice = 'voice',
    OTP_DLT = 'otpDlt',
}

export const INTL_INPUT_OPTION = {
    nationalMode: true,
    utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.17/js/utils.js',
    autoHideDialCode: false,
    separateDialCode: false,
    initialCountry: 'auto',
    geoIpLookup: (success: any, failure: any) => {
        let countryCode = 'in';
        const fetchIPApi = ajax({
            url: 'https://api.db-ip.com/v2/free/self',
            method: 'GET',
        });

        fetchIPApi.subscribe({
            next: (res: any) => {
                if (res?.response?.ipAddress) {
                    const fetchCountryByIpApi = ajax({
                        url: `http://ip-api.com/json/${res.response.ipAddress}`,
                        method: 'GET',
                    });

                    fetchCountryByIpApi.subscribe({
                        next: (fetchCountryByIpApiRes: any) => {
                            if (fetchCountryByIpApiRes?.response?.countryCode) {
                                return success(fetchCountryByIpApiRes.response.countryCode);
                            } else {
                                return success(countryCode);
                            }
                        },
                        error: (fetchCountryByIpApiErr) => {
                            const fetchCountryByIpInfoApi = ajax({
                                url: `https://ipinfo.io/${res.response.ipAddress}/json`,
                                method: 'GET',
                            });

                            fetchCountryByIpInfoApi.subscribe({
                                next: (fetchCountryByIpInfoApiRes: any) => {
                                    if (fetchCountryByIpInfoApiRes?.response?.country) {
                                        return success(fetchCountryByIpInfoApiRes.response.country);
                                    } else {
                                        return success(countryCode);
                                    }
                                },
                                error: (fetchCountryByIpInfoApiErr) => {
                                    return success(countryCode);
                                },
                            });
                        },
                    });
                } else {
                    return success(countryCode);
                }
            },
            error: (err) => {
                return success(countryCode);
            },
        });
    },
};

export const DEFAULT_START_DATE = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
export const DEFAULT_START_DATE_SEVEN_DAYS_AGO = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate() - 6
);
export const DEFAULT_END_DATE = new Date();
export const DEFAULT_SELECTED_DATE_RANGE = cloneDeep({
    start: DEFAULT_START_DATE,
    end: DEFAULT_END_DATE,
});
export const DEFAULT_SEVEN_DAYS_DATE_RANGE = cloneDeep({
    start: DEFAULT_START_DATE_SEVEN_DAYS_AGO,
    end: DEFAULT_END_DATE,
});
export const ADMIN_NO_USER_SELECTED_MSG =
    'Currently there is no user selected. Please select a user using top-right Search bar.';
export const SUPPORTED_LOG_EVENTS = ['Queued', 'Accepted', 'Delivered', 'Failed', 'Rejected', 'Bounced'];
