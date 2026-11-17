/**
 * Prompt builders for handing 36Blocks setup to the user's own AI coding agent.
 *
 * The agent signs in through the 36Blocks MCP server's browser authorization (OAuth), so no prompt ever carries a
 * credential, token, secret, key or block reference id. Everything the agent needs it reads through the connector.
 *
 * Rules:
 * - Keep prompts short and point at the public docs for detail.
 * - Values embedded in a prompt (the block name, a reference id) are validated first, so nothing unvalidated can inject
 *   instructions.
 * This file is deliberately dependency-free so it can be unit tested without Angular.
 */

export const LLMS_TXT_URL = 'https://developers.36blocks.com/llms.txt';
export const MCP_SERVER_URL = 'https://mcp.docstar.io/connector/36blocks_user_api';
/** Name used when registering the MCP server in a tool. */
export const MCP_SERVER_NAME = '36blocks';
export const CLI_INIT_COMMAND = 'npx docstar-cli init 36blocks_user_api';
export const CLI_RUN_HINT = 'npx docstar-cli 36blocks_user_api <module> <endpoint> [--flags]';
export const CLI_LIST_COMMAND = 'npx docstar-cli list 36blocks_user_api';

export type AiPromptKind = 'general' | 'block' | 'setup';

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

export function isValidReferenceId(value: unknown): value is string {
    return typeof value === 'string' && REFERENCE_ID_PATTERN.test(value);
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
// Prompts
// ---------------------------------------------------------------------------------------------------------------------

const CONNECT_LINES = `To run the APIs, prefer the MCP server: ${MCP_SERVER_URL}
When it asks you to sign in, finish the 36Blocks sign-in and approval in the browser. Don't ask me to paste a key, token or reference id.

If you can't connect MCP, use the CLI instead (run once to install the modules): ${CLI_INIT_COMMAND}
Then: ${CLI_RUN_HINT}  (${CLI_LIST_COMMAND} shows what's available)`;

/** The homepage prompt: MCP first, with the browser sign-in done by the user, never a pasted credential. */
export function buildGeneralIntegrationPrompt(): string {
    return `Integrate 36Blocks User APIs into our project based on our requirement and use cases.
First, read the official API documentation at ${LLMS_TXT_URL}.
Ask what I want to build if I haven't explained it yet.

${CONNECT_LINES}`;
}

/** For one specific, existing block. Returns null when the block's reference id is not a plain identifier. */
export function buildBlockIntegrationPrompt(context: BlockPromptContext): string | null {
    if (!isValidReferenceId(context?.referenceId)) return null;
    return blockPromptBody(context, CONNECT_LINES);
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
// The setup wizard prompt
// ---------------------------------------------------------------------------------------------------------------------

export interface SetupPromptInput {
    /** Name of the block to create. Validated with `checkBlockName`. */
    blockName: string;
}

/**
 * The wizard prompt: the agent connects the 36Blocks MCP server, completes the browser sign-in, creates one block with
 * the given name, configures the login method and redirect URL for the user's app, and adds the widget using the
 * `reference_id` the API returns. Returns null unless the block name is valid, so nothing unvalidated is embedded.
 */
export function buildSetupPrompt(input: SetupPromptInput): string | null {
    const name = checkBlockName(input?.blockName);
    if (!name.valid) return null;

    return `Set up 36Blocks authentication for my app: create a 36Blocks block named "${name.value}" and add its widget to this project.

Docs: ${LLMS_TXT_URL}

Do these in order:
1. Connect to the 36Blocks MCP server: ${MCP_SERVER_URL}
   If you can't use MCP, use the CLI instead: ${CLI_INIT_COMMAND}
2. When it asks you to sign in, I will finish the 36Blocks sign-in and approval in my browser. Don't ask me to paste a key, token or block reference id: you get everything through the connection.
3. Create the block named "${name.value}" (Authorization block type), then read it back.
4. Configure the login method and the redirect URL that suit my app. Inspect the project to work out the framework, the URL the app runs on and the sign-in methods it needs. Ask me only if you can't infer it. Allowed origins are bare hosts (no scheme, no port).
5. Add the widget to my app by following the docs. Use the block's reference_id from the API response.
6. Tell me what you changed.

Careful:
- If a create call fails or times out, list my blocks before retrying so you don't create a duplicate.
- Don't create a subscription block.
- Block responses can contain provider credentials: treat them as secret and never print or commit them.`;
}

export interface ResolvedPrompt {
    kind: AiPromptKind;
    prompt: string;
}

/**
 * Picks the prompt for the dialog: a specific block gets the block prompt, everything else (including an unusable block
 * context) gets the general prompt. No prompt contains a credential.
 */
export function resolvePrompt(state: { block: BlockPromptContext | null }): ResolvedPrompt {
    const blockPrompt = state.block ? buildBlockIntegrationPrompt(state.block) : null;
    if (blockPrompt) return { kind: 'block', prompt: blockPrompt };
    return { kind: 'general', prompt: buildGeneralIntegrationPrompt() };
}
