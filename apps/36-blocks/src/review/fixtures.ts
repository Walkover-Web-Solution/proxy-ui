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
        id: 302,
        session_id: 0,
        operation: 'create_feature_configuration',
        user: null,
        created_at: '2026-10-30T05:40:00Z',
        audit_context: {
            actor_type: 'auth_key',
            auth_key_id: 31,
            auth_key_name: 'AI_setup',
            source_ip: '203.0.113.9',
            outcome: 'succeeded',
        },
    },
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
const permissionNames = [
    'View client users',
    'Create client user',
    'Update user role',
    'View authkeys',
    'Create authkey',
    'Edit authkey',
    'Delete authkey',
];
const operatorRoles = [
    { id: 4, role_name: 'User', permissions: permissionNames.slice(0, 1).concat(permissionNames.slice(3, 4)) },
    { id: 3, role_name: 'Admin', permissions: permissionNames.slice(0, 6) },
    { id: 2, role_name: 'Owner', permissions: permissionNames },
    { id: 1, role_name: 'Super admin', permissions: permissionNames },
].map((role) => ({ ...role, permissions: role.permissions.map((permission) => ({ permission })) }));
const teamMember = (
    id: number,
    fname: string,
    lname: string,
    role: { id: number; role_name: string },
    invite_status: string,
    updated_at: string
) => ({
    id,
    email: `${fname.toLowerCase()}@example.test`,
    fname,
    lname,
    mobile: null,
    is_registered: invite_status === 'accepted',
    stage: invite_status === 'accepted' ? 'onboarded' : 'invited',
    created_at: '2026-10-20T08:00:00Z',
    client_user: {
        id: 100 + id,
        status: invite_status === 'accepted' ? 'enabled' : 'disabled',
        invite_status,
        created_at: '2026-10-20T08:00:00Z',
        updated_at,
        role,
    },
});
const teamMembers = [
    teamMember(2, 'Review', 'Admin', { id: 3, role_name: 'Admin' }, 'accepted', '2026-10-20T08:00:00Z'),
    teamMember(3, 'Morgan', 'Chen', { id: 4, role_name: 'User' }, 'accepted', '2026-10-21T08:00:00Z'),
    teamMember(4, 'Jordan', '', { id: 4, role_name: 'User' }, 'pending', '2020-01-01T00:00:00Z'),
    teamMember(5, 'Casey', 'Lopez', { id: 3, role_name: 'Admin' }, 'rejected', '2026-10-22T08:00:00Z'),
];
const apiKeys = [
    { id: 21, name: 'default', authkey: '0123456789abcdef0123456789abcdef', role_id: 2, status: 'active' },
    { id: 22, name: 'backend_sync', authkey: 'fedcba9876543210fedcba9876543210', role_id: 3, status: 'inactive' },
].map((key) => ({
    ...key,
    created_at: '2026-10-20T08:00:00Z',
    updated_at: '2026-10-20T08:00:00Z',
    created_by: { id: 2, name: 'Review Admin', email: 'admin@example.test' },
    updated_by: { id: 2, name: 'Review Admin', email: 'admin@example.test' },
}));
/** Obviously fake: never a real credential. Matches the shape the real API returns (32 characters). */
export const FAKE_AUTH_KEY = 'FAKEFAKEFAKEFAKEFAKEFAKEFAKE0001';
const newBlock = (name: string, referenceId: string) => ({
    id: 13,
    name,
    reference_id: referenceId,
    feature_id: 1,
    created_at: '2026-11-12T08:00:00Z',
    updated_at: '2026-11-12T08:00:00Z',
    feature: { name: 'Authentication' },
    services: [{ name: 'Google' }],
});
const reviewKeys: any[] = [];
export function reviewCreateKey(name: string, roleId: number): any {
    const key = {
        id: 31,
        name,
        authkey: FAKE_AUTH_KEY,
        role_id: roleId,
        status: 'active',
        created_at: '2026-11-12T08:00:00Z',
        updated_at: '2026-11-12T08:00:00Z',
    };
    reviewKeys.push(key);
    return key;
}
export function reviewUpdateKey(id: number, status: string): any {
    const key = reviewKeys.find((item) => item.id === id);
    if (key) key.status = status;
    return key ?? { id, status };
}
/** Machine permission names, as `GET /getUserPermissions` returns them (a flat list). */
const ownerPermissions = ['view_clients', 'view_authkeys', 'create_authkey', 'edit_authkey', 'delete_authkey'];
const readerPermissions = ['view_clients', 'view_authkeys'];

export function reviewData(path: string, params: HttpParams, flags: string[] = []): any {
    if (path === 'getUserPermissions') return flags.includes('noperm') ? readerPermissions : ownerPermissions;
    if (path === 'users') {
        const term = params.get('name')?.toLowerCase();
        return page(
            teamMembers.filter(
                (member) =>
                    !term ||
                    `${member.fname} ${member.lname}`.toLowerCase().includes(term) ||
                    member.email.toLowerCase().includes(term)
            )
        );
    }
    if (path === 'rolePermissions') return page(operatorRoles);
    if (path === 'authentications') {
        const existing = flags.includes('haskey')
            ? [{ ...apiKeys[0], id: 40, name: 'AI_setup', authkey: FAKE_AUTH_KEY }]
            : [];
        return page([...apiKeys, ...existing, ...reviewKeys]);
    }
    if (path === 'getClientSettings') return { client, role: { id: 3, role_name: 'Admin' } };
    if (path === 'clients') return page([client]);
    if (path === 'features') {
        // Flags simulate the agent finishing: the new block appears under the chosen name, or under another one.
        if (flags.includes('appear')) return page([newBlock('Customer login', 'customer-login')]);
        if (flags.includes('appear-other')) return page([newBlock('Mobile app auth', 'mobile-app-auth')]);
        if (flags.includes('appear-more')) return page([...blocks, newBlock('Customer login', 'customer-login')]);
    }
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
