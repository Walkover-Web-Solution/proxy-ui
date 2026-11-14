/**
 * Helpers for the wizard's block checks: spotting a name that is already taken (best effort) and recognising the block
 * the agent created. Dependency-free so it can be unit tested without Angular.
 */

export interface BlockSummary {
    id: number;
    name: string;
    referenceId: string;
}

/** Names are compared the way a person would: ignoring case and surrounding or repeated spaces. */
export function normalizeBlockName(name: unknown): string {
    return typeof name === 'string' ? name.trim().replace(/\s+/g, ' ').toLowerCase() : '';
}

/** True when a block with this name already exists in the given list. Best effort: the server is the authority. */
export function blockNameTaken(name: string, blocks: readonly BlockSummary[]): boolean {
    const wanted = normalizeBlockName(name);
    return !!wanted && blocks.some((block) => normalizeBlockName(block.name) === wanted);
}

export interface BlockBaseline {
    /** Ids that existed when the prompt was handed out. */
    ids: ReadonlySet<number>;
    total: number;
}

export function makeBaseline(blocks: readonly BlockSummary[], total: number): BlockBaseline {
    return { ids: new Set(blocks.map((block) => block.id)), total };
}

export type NewBlockResult =
    | { kind: 'none' }
    /** A block with the chosen name appeared. */
    | { kind: 'named'; block: BlockSummary }
    /** The agent changed the name, but a block that did not exist before has appeared. */
    | { kind: 'other'; block: BlockSummary };

/**
 * Looks for the block the agent created. A block with the chosen name that was not there before wins; otherwise any
 * block that was not there before (the newest, by id) counts, so a renamed block is still recognised. Without a
 * baseline (it could not be read) only a name match counts, because an unknown block cannot be told from an old one.
 */
export function detectNewBlock(
    baseline: BlockBaseline | null,
    current: readonly BlockSummary[],
    total: number,
    chosenName: string
): NewBlockResult {
    const wanted = normalizeBlockName(chosenName);
    const isNew = (block: BlockSummary) => (baseline ? !baseline.ids.has(block.id) : true);
    const named = current.filter((block) => normalizeBlockName(block.name) === wanted && isNew(block));
    if (named.length) return { kind: 'named', block: named.sort((a, b) => b.id - a.id)[0] };
    if (!baseline) return { kind: 'none' };
    const fresh = current.filter(isNew).sort((a, b) => b.id - a.id);
    if (fresh.length && total > baseline.total) return { kind: 'other', block: fresh[0] };
    return { kind: 'none' };
}
