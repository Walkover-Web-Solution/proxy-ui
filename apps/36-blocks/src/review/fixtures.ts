import { HttpParams } from '@angular/common/http';
export const page = (data: any[]) => ({
    data,
    itemsPerPage: 25,
    pageNo: 1,
    pageNumber: 1,
    totalEntityCount: data.length,
    totalPageCount: data.length ? 1 : 0,
});
const client = { id: 1, name: 'Acme workspace', url_unique_id: 'review', email: 'team@example.test' };
const blocks = [
    {
        id: 11,
        name: 'People portal',
        reference_id: 'people-portal',
        feature_id: 1,
        created_at: '2026-10-20T08:00:00Z',
        updated_at: '2026-10-29T10:00:00Z',
        feature: { name: 'Authentication' },
        services: [{ name: 'Email & password' }],
    },
    {
        id: 12,
        name: 'Support desk',
        reference_id: 'support-desk',
        feature_id: 1,
        created_at: '2026-10-22T08:00:00Z',
        updated_at: '2026-10-29T12:00:00Z',
        feature: { name: 'Authentication' },
        services: [{ name: 'Google' }],
    },
];
const people = ['Alex Lee', 'Morgan Chen', 'Sam Rivera', 'Jamie Patel', 'Taylor Kim'].map((name, i) => ({
    id: 25 + i,
    name,
    email: name.toLowerCase().replace(' ', '.') + '@example.test',
    mobile: null,
    is_block: false,
    feature_configuration: blocks[i % 2],
    created_at: `2026-10-${22 + i}T08:30:00Z`,
    last_login_at: i === 3 ? null : '2026-10-30T05:20:00Z',
}));
const operations = [
    {
        id: 301,
        session_id: 1,
        operation: 'login_as',
        user: { user_id: 2, name: 'Review Admin', email: 'admin@example.test' },
        created_at: '2026-10-30T05:30:00Z',
        audit_context: {
            actor_user_id: 2,
            target_user_id: 25,
            target_company_id: 10,
            feature_configuration_id: 11,
            reason: 'Reproduce the reported sign-in issue. TEST-123',
            outcome: 'succeeded',
        },
    },
    {
        id: 300,
        session_id: 1,
        operation: 'login_as',
        user: { user_id: 2, name: 'Review Admin', email: 'admin@example.test' },
        created_at: '2026-10-30T05:10:00Z',
        audit_context: {
            actor_user_id: 2,
            target_user_id: 26,
            target_company_id: 10,
            feature_configuration_id: 12,
            reason: 'Investigate company membership. TEST-122',
            outcome: 'denied',
            failure_code: 'membership_denied',
        },
    },
    {
        id: 299,
        session_id: 1,
        operation: 'view_c_users',
        user: { user_id: 2, name: 'Review Admin', email: 'admin@example.test' },
        created_at: '2026-10-30T05:00:00Z',
        audit_context: null,
    },
];
export function reviewData(path: string, params: HttpParams): any {
    if (path === 'getClientSettings') return { client, role: { id: 3, role_name: 'Admin' } };
    if (path === 'clients') return page([client]);
    if (path === 'features')
        return page(
            blocks.filter(
                (b) => !params.get('search') || b.name.toLowerCase().includes(params.get('search')!.toLowerCase())
            )
        );
    if (path === 'getFeatures') return [{ id: 1, name: 'Authentication', description: 'Application sign-in' }];
    if (path === 'featureWebhookEvents') return [];
    if (path === 'getMethodsService/1')
        return [
            {
                id: 1,
                name: 'Authentication',
                service_use: 'authentication',
                icon: 'login',
                authorization_format: { format: {}, encode_type: 'json', key: '' },
                method_services: [
                    {
                        name: 'Email & password',
                        method_id: 1,
                        service_id: 1,
                        is_enable: true,
                        requirements: {},
                        configurations: { fields: {}, mappings: [] },
                    },
                ],
            },
        ];
    const detail = blocks.find((block) => path === `features/${block.id}`);
    if (detail)
        return {
            ...detail,
            method_id: 1,
            method: { id: 1, name: 'Authentication' },
            session_time: 3600,
            callback_url: '',
            redirect_url: '',
            block_registration: false,
            extra_configurations: {},
            origins: [],
            service_configurations: [],
            authorization_format: { format: {}, encode_type: 'json', key: '' },
        };
    if (/^features\/\d+\/(allowedOrigins|clientSecrets|oauthConfigs|blockScopes)$/.test(path)) return [];
    if (path === 'clientUsers')
        return page(
            people.filter(
                (p) =>
                    (!params.get('search') ||
                        p.name.toLowerCase().includes(params.get('search')!.toLowerCase()) ||
                        p.email === params.get('search')) &&
                    (!params.get('feature_id') || p.feature_configuration.reference_id === params.get('feature_id')) &&
                    (!params.get('company_name') || params.get('company_name') === 'Acme')
            )
        );
    if (path === 'operations')
        return page(
            operations.filter(
                (o) =>
                    (!params.get('target_user_id') ||
                        o.audit_context?.target_user_id === Number(params.get('target_user_id'))) &&
                    (!params.get('outcome') || o.audit_context?.outcome === params.get('outcome'))
            )
        );
    if (path === 'analytics/overview')
        return {
            data: {
                users: {
                    client_total: 128,
                    feature_configuration_total: params.get('feature_configuration_id') ? 0 : null,
                },
                signups: { total: 12 },
                logins: { total: 86 },
                active_users: { unique: 42 },
            },
        };
    if (path === 'analytics/timeseries')
        return { data: [3, 7, 5, 10, 8, 14, 12].map((value, i) => ({ period: `Oct ${24 + i}`, value })) };
    if (path === 'analytics/breakdown')
        return {
            data: [
                { key: 'Email & password', count: 62 },
                { key: 'Google', count: 24 },
            ],
        };
    if (path === 'projects') return page([{ id: 1, name: 'People portal' }]);
    if (path === 'environments')
        return page([
            { id: 1, name: 'Development' },
            { id: 2, name: 'Production' },
        ]);
    if (path === 'proxyLogs')
        return page([
            {
                id: 401,
                created_at: '2026-10-30T05:45:00Z',
                project_name: 'People portal',
                environment_name: 'Development',
                user_ip: '192.0.2.15',
                endpoint: '/api/profile',
                request_type: 'GET',
                status_code: 401,
                response_time: 48,
            },
            {
                id: 400,
                created_at: '2026-10-30T05:44:00Z',
                project_name: 'People portal',
                environment_name: 'Development',
                user_ip: '192.0.2.15',
                endpoint: '/api/profile',
                request_type: 'GET',
                status_code: 200,
                response_time: 32,
            },
        ]);
    if (path.startsWith('proxyLogs/'))
        return {
            id: 401,
            request_body: {},
            headers: { 'content-type': 'application/json' },
            response: { message: 'Session expired. Sign in again.', code: 'session_expired' },
        };
    if (path.endsWith('/cRoles') || path.endsWith('/cPermission')) return page([]);
    return undefined;
}
