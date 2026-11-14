/**
 * Prompt builders for handing 36Blocks setup to the user's own AI coding agent.
 *
 * Rules:
 * - Keep prompts short and point at the public docs for detail.
 * - The public/general prompt and the plain block prompt never contain a credential, token, secret or personal data.
 * - Only the two "keyed" prompts (`buildSetupPrompt`, `buildBlockUpdatePrompt`) carry a workspace auth key. They exist
 *   only for the signed-in dashboard, are built on demand from in-memory state and must never be rendered on the public
 *   website, logged or stored. Everything else embedded in them (block name, base URL, reference id) is validated first.
 * This file is deliberately dependency-free so it can be unit tested without Angular.
 */

export const LLMS_TXT_URL = 'https://developers.36blocks.com/llms.txt';
export const MCP_SERVER_URL = 'https://mcp.docstar.io/connector/36blocks_user_api';
/** Name used when registering the MCP server in a tool. */
export const MCP_SERVER_NAME = '36blocks';
export const CLI_INIT_COMMAND = 'npx docstar-cli init 36blocks_user_api';
export const CLI_RUN_HINT = 'npx docstar-cli 36blocks_user_api <module> <endpoint> [--flags]';
export const CLI_LIST_COMMAND = 'npx docstar-cli list 36blocks_user_api';

/** Header the block-management APIs read the workspace key from (not `Authorization`). */
export const AUTHKEY_HEADER = 'authkey';
/** Environment variable the agent is told to keep the key in. A name must not start with a digit. */
export const AUTHKEY_ENV_VAR = 'BLOCKS36_AUTHKEY';

/**
 * How the key may be used besides plain HTTPS. Plain HTTPS with the header is always correct. The CLI flag is documented
 * on DocStar's CLI page (a key is passed as `--authkey <key>`; the CLI never reads environment variables, so the shell
 * expands the variable). How the hosted MCP connector receives the key is NOT confirmed, so it is mentioned only
 * conditionally. Adjust this one constant when that is confirmed.
 */
export const KEYED_TRANSPORT_NOTE = `Plain HTTPS calls (curl or your HTTP client) always work. With the 36Blocks CLI (${CLI_INIT_COMMAND}), pass the key as --authkey "$${AUTHKEY_ENV_VAR}". The MCP connector (${MCP_SERVER_URL}) may ask you for the authkey value; if it cannot send that header, use plain HTTPS.`;

export type AiPromptKind = 'general' | 'block' | 'block-key' | 'setup';

export interface BlockPromptContext {
    /** The block's `reference_id` (public identifier, not a secret). */
    referenceId: string;
    /** Human block type, e.g. "Authorization". Optional: omitted when the page does not know it. */
    blockType?: string | null;
    /** Widget script `type` for the block, e.g. "authorization". Optional. */
    widgetType?: string | null;
    /** URL of the widget script (`proxy-auth.js`). Optional. */
    scriptUrl?: string | null;
}

const REFERENCE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;
const LABEL_PATTERN = /^[A-Za-z0-9 _-]{1,40}$/;
const AUTH_KEY_PATTERN = /^[A-Za-z0-9]{16,64}$/;

export function isValidReferenceId(value: unknown): value is string {
    return typeof value === 'string' && REFERENCE_ID_PATTERN.test(value);
}

/** True for a value shaped like a workspace auth key (the server issues 32 hex characters). */
export function isValidAuthKey(value: unknown): value is string {
    return typeof value === 'string' && AUTH_KEY_PATTERN.test(value);
}

function safeLabel(value: unknown): string | null {
    return typeof value === 'string' && LABEL_PATTERN.test(value.trim()) ? value.trim() : null;
}

function safeHttpUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Block name
// ---------------------------------------------------------------------------------------------------------------------

export const BLOCK_NAME_MIN = 2;
export const BLOCK_NAME_MAX = 60;
/**
 * The server rule is `^[a-zA-Z0-9][a-zA-Z0-9_\s]+$`. `\s` also matches tabs and line breaks, which must never reach a
 * prompt, so only plain spaces are accepted here (a strict subset of the server rule).
 */
export const BLOCK_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_ ]+$/;

export type BlockNameProblem = 'required' | 'too-short' | 'too-long' | 'characters';

export interface BlockNameCheck {
    valid: boolean;
    /** The trimmed name; only meaningful when `valid`. */
    value: string;
    problem: BlockNameProblem | null;
}

export function checkBlockName(raw: unknown): BlockNameCheck {
    const value = typeof raw === 'string' ? raw.trim() : '';
    const fail = (problem: BlockNameProblem): BlockNameCheck => ({ valid: false, value, problem });
    if (!value) return fail('required');
    if (value.length < BLOCK_NAME_MIN) return fail('too-short');
    if (value.length > BLOCK_NAME_MAX) return fail('too-long');
    if (!BLOCK_NAME_PATTERN.test(value)) return fail('characters');
    return { valid: true, value, problem: null };
}

export function blockNameMessage(problem: BlockNameProblem | null): string {
    switch (problem) {
        case 'required':
            return 'Enter a name for the block.';
        case 'too-short':
            return `Use at least ${BLOCK_NAME_MIN} characters.`;
        case 'too-long':
            return `Use at most ${BLOCK_NAME_MAX} characters.`;
        case 'characters':
            return 'Start with a letter or number. Use only letters, numbers, spaces and underscores.';
        default:
            return '';
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Normalises the dashboard's API base URL for a prompt. Only an absolute http(s) URL without credentials, query or
 * fragment is accepted; a trailing slash is removed. Returns null otherwise.
 */
export function normalizeBaseUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value.trim());
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
        if (url.username || url.password || url.search || url.hash) return null;
        return `${url.origin}${url.pathname}`.replace(/\/+$/, '');
    } catch {
        return null;
    }
}

// ---------------------------------------------------------------------------------------------------------------------
// Prompts without a credential
// ---------------------------------------------------------------------------------------------------------------------

const CONNECT_LINES = `To run the APIs, prefer the MCP server: ${MCP_SERVER_URL}

If you can't connect MCP, use the CLI instead (run once to install the modules): ${CLI_INIT_COMMAND}
Then: ${CLI_RUN_HINT}  (${CLI_LIST_COMMAND} shows what's available)`;

/** The existing homepage prompt. Wording is unchanged. */
export function buildGeneralIntegrationPrompt(): string {
    return `Integrate 36Blocks User APIs into our project based on our requirement and use cases.
First, read the official API documentation at ${LLMS_TXT_URL}.
Ask what I want to build if I haven't explained it yet.

${CONNECT_LINES}`;
}

/** For one specific, existing block. Returns null when the block's reference id is not a plain identifier. */
export function buildBlockIntegrationPrompt(context: BlockPromptContext): string | null {
    if (!isValidReferenceId(context?.referenceId)) return null;
    return blockPromptBody(
        context,
        `${CONNECT_LINES}
Sign in through the connector or CLI sign-in flow. Don't ask me to paste tokens or secrets into this chat.`
    );
}

function blockPromptBody(context: BlockPromptContext, transport: string): string {
    const blockType = safeLabel(context.blockType);
    const widgetType = safeLabel(context.widgetType);
    const scriptUrl = safeHttpUrl(context.scriptUrl);

    const details = [`Block reference_id: ${context.referenceId}`];
    if (blockType) details.push(`Block type: ${blockType}`);
    if (widgetType) details.push(`Widget type: ${widgetType}`);
    if (scriptUrl) details.push(`Widget script: ${scriptUrl}`);

    return `Integrate an existing 36Blocks block into our project. Don't create a new block.
${details.join('\n')}

First, read the official API documentation at ${LLMS_TXT_URL}.
Ask which app or framework this is for if I haven't said. If you need the block's settings (methods, redirect URL, allowed origins), read them with the Get Block API.

${transport}`;
}

// ---------------------------------------------------------------------------------------------------------------------
// Prompts that carry a workspace auth key (signed-in dashboard only)
// ---------------------------------------------------------------------------------------------------------------------

export interface KeyedPromptInput {
    /** Dashboard API base URL, e.g. `https://routes.msg91.com/api`. */
    baseUrl: string;
    /** The workspace auth key. Never log or store the resulting prompt. */
    authKey: string;
}

export interface SetupPromptInput extends KeyedPromptInput {
    /** Name of the block to create. Validated with `checkBlockName`. */
    blockName: string;
}

export type BlockUpdatePromptInput = KeyedPromptInput & BlockPromptContext;

function credentialLines(baseUrl: string, authKey: string): string {
    return `Credential (treat it like a password):
  API base URL: ${baseUrl}
  Header:       ${AUTHKEY_HEADER}: ${authKey}
Send that header on every call (not "Authorization"). ${KEYED_TRANSPORT_NOTE}`;
}

/**
 * The wizard prompt: the agent asks the user which sign-in methods they want, works out the redirect URL and allowed
 * origins from the project, creates one block with the given name through the API and integrates it.
 * Returns null unless the block name, base URL and key are all valid, so nothing unvalidated is ever embedded.
 */
export function buildSetupPrompt(input: SetupPromptInput): string | null {
    const name = checkBlockName(input?.blockName);
    const baseUrl = normalizeBaseUrl(input?.baseUrl);
    if (!name.valid || !baseUrl || !isValidAuthKey(input?.authKey)) return null;

    return `Set up 36Blocks authentication for my app. A 36Blocks block named "${name.value}" must be created, then integrated into this project.

Docs: start at ${LLMS_TXT_URL}. The block operations are in its "Server-to-Server (Auth Key)" section.

${credentialLines(baseUrl, input.authKey)}

Do these in order:
1. Store the key in the environment variable ${AUTHKEY_ENV_VAR} (a git-ignored .env file is fine). Never print, log or commit it.
2. Look up the block types (Get Block Types) and the methods and services of the type you use (Get Block Methods and Services).
3. Ask me which sign-in methods I want, and for any provider credentials those methods need. Don't invent them.
4. Inspect my project, then propose the redirect URL and the allowed origins (bare hosts such as localhost or app.example.com: no scheme, no port). Confirm both with me before creating anything.
5. Create the block once (Create Block), then read it back (Get Block, List Allowed Origins).
6. Integrate it into my app by following the docs, and tell me what you changed.

Careful:
- Don't retry a create that returned 201 or 418. List blocks first to see whether it exists.
- Use the Authorization block type. Don't create a subscription block.
- Get Block responses contain provider credentials: treat them as secret and never print them.`;
}

/**
 * For an existing block when the user explicitly lets their agent change it: same credential, but the agent reads and
 * updates that block instead of creating one. Returns null for an invalid reference id, base URL or key.
 */
export function buildBlockUpdatePrompt(input: BlockUpdatePromptInput): string | null {
    const baseUrl = normalizeBaseUrl(input?.baseUrl);
    if (!isValidReferenceId(input?.referenceId) || !baseUrl || !isValidAuthKey(input?.authKey)) return null;
    const blockType = safeLabel(input.blockType);
    const widgetType = safeLabel(input.widgetType);
    const scriptUrl = safeHttpUrl(input.scriptUrl);

    const details = [`Block reference_id: ${input.referenceId}`];
    if (blockType) details.push(`Block type: ${blockType}`);
    if (widgetType) details.push(`Widget type: ${widgetType}`);
    if (scriptUrl) details.push(`Widget script: ${scriptUrl}`);

    return `Read and update an existing 36Blocks block for my app. Don't create a new block.
${details.join('\n')}

Docs: start at ${LLMS_TXT_URL}. The block operations are in its "Server-to-Server (Auth Key)" section.

${credentialLines(baseUrl, input.authKey)}

Do these in order:
1. Store the key in the environment variable ${AUTHKEY_ENV_VAR} (a git-ignored .env file is fine). Never print, log or commit it.
2. Find the block's numeric id with List Blocks (match the reference_id above), then read it with Get Block and List Allowed Origins.
3. Ask me what I want to change. Send only the changed fields with Update Block. Allowed origins are replaced as a whole list: send the full list you want (bare hosts, no scheme, no port).
4. If the app code needs to change too, make the change by following the docs and tell me what you changed.

Careful:
- Get Block responses contain provider credentials: treat them as secret and never print them.
- Don't set redirect_response_mode to "code".`;
}

/** Replaces every occurrence of the key in a prompt, for showing the prompt on screen without exposing the secret. */
export function maskKeyInPrompt(prompt: string, authKey: string): string {
    if (!authKey) return prompt;
    return prompt.split(authKey).join('•'.repeat(12));
}

export interface ResolvedPrompt {
    kind: AiPromptKind;
    prompt: string;
}

/**
 * Picks the prompt for the dialog: a specific block gets the block prompt, everything else (including an unusable block
 * context) gets the general prompt. A prompt that contains a key is never produced here.
 */
export function resolvePrompt(state: { block: BlockPromptContext | null }): ResolvedPrompt {
    const blockPrompt = state.block ? buildBlockIntegrationPrompt(state.block) : null;
    if (blockPrompt) return { kind: 'block', prompt: blockPrompt };
    return { kind: 'general', prompt: buildGeneralIntegrationPrompt() };
}
