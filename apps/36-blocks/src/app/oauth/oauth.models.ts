/** Types for the AI-tool (MCP) OAuth consent flow and the "Connected AI tools" list. */

export interface OAuthScope {
    key: string;
    label: string;
}

export interface OAuthWorkspace {
    id: number;
    name: string;
}

/** `GET operator/oauth/authorize` success data. */
export interface OAuthAuthorizeData {
    client_name: string;
    redirect_uri: string;
    state?: string | null;
    scopes: OAuthScope[];
    /** The workspace the grant will be pinned to; null when the operator has no current workspace. */
    workspace: OAuthWorkspace | null;
}

export type OAuthDecisionAction = 'approve' | 'deny';

/** `POST operator/oauth/decision` body. All values come verbatim from the authorize page URL. */
export interface OAuthDecisionRequest {
    client_id: string;
    redirect_uri: string;
    state: string;
    scope: string;
    code_challenge: string;
    code_challenge_method: string;
    action: OAuthDecisionAction;
}

/** `POST operator/oauth/decision` success data. `redirect_to` carries the authorization code: a secret. */
export interface OAuthDecisionData {
    redirect_to: string;
}

export interface OAuthConnection {
    id: number | string;
    client_name: string;
    workspace: OAuthWorkspace | null;
    scopes: string[];
    created_at: string | null;
    last_used_at: string | null;
}
