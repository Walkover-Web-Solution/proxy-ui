import { createUrl } from '@proxy/service';

/** Operator-authenticated endpoints of the AI-tool (MCP) OAuth flow. The base URL already ends in `/api`. */
export const OAuthUrls = {
    authorize: (baseUrl: string) => createUrl(baseUrl, 'operator/oauth/authorize'),
    decision: (baseUrl: string) => createUrl(baseUrl, 'operator/oauth/decision'),
    connections: (baseUrl: string) => createUrl(baseUrl, 'operator/oauth/connections'),
    revokeConnection: (baseUrl: string, id: number | string) =>
        createUrl(baseUrl, `operator/oauth/connections/${encodeURIComponent(String(id))}/revoke`),
};
