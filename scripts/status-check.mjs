#!/usr/bin/env node
/**
 * Fail when application code changed without STATUS.md.
 *
 * Code directories are apps/, libs/ and tools/. This repo has no root src/
 * or migrations/ tree. migrations.json is the Nx manifest and is not watched.
 *
 * Against the base branch, a code diff must include STATUS.md unless every
 * commit in that range that touches those directories contains `[no status]`.
 * An uncommitted code edit is held to the same rule against HEAD: STATUS.md
 * must be uncommitted too. A STATUS.md edit already on the branch does not
 * cover a new uncommitted code edit.
 *
 * Always prints commits that touch those directories after the
 * "Reviewed up to commit" hash in STATUS.md.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const CODE_DIRS = ['apps', 'libs', 'tools'];
const STATUS_PATH = 'STATUS.md';

function git(args, { allowFailure = false } = {}) {
    try {
        return execFileSync('git', args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'pipe'],
        });
    } catch (error) {
        if (allowFailure) return '';
        const stderr = error.stderr?.toString().trim();
        const detail = stderr || error.message;
        throw new Error(`git ${args.join(' ')} failed: ${detail}`);
    }
}

function tryRev(ref) {
    if (!ref) return '';
    return git(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`], { allowFailure: true }).trim();
}

function resolveBase() {
    const explicit = process.env.STATUS_BASE?.trim();
    const gh = process.env.GITHUB_BASE_REF?.trim();
    const candidates = [];
    if (explicit && explicit !== 'origin' && explicit !== 'origin/') candidates.push(explicit);
    if (gh) candidates.push(`origin/${gh}`, gh);
    candidates.push('origin/stage', 'stage', 'origin/production', 'production');
    for (const candidate of candidates) {
        const hash = tryRev(candidate);
        if (hash) return { ref: candidate, hash };
    }
    throw new Error('Could not resolve a base branch. Set STATUS_BASE to a commit or branch.');
}

function isCodePath(file) {
    return CODE_DIRS.some((dir) => file === dir || file.startsWith(`${dir}/`));
}

function parsePorcelain(output) {
    if (!output) return [];
    const paths = [];
    for (const line of output.split('\n')) {
        if (!line.trim()) continue;
        let rest = line.slice(3);
        if (rest.startsWith('"') && rest.endsWith('"')) {
            rest = rest.slice(1, -1).replace(/\\"/g, '"');
        }
        for (const part of rest.split(' -> ')) paths.push(part);
    }
    return paths;
}

function dirtyPaths(pathspecs) {
    const output = git(['status', '--porcelain=v1', '-uall', '--', ...pathspecs]);
    return parsePorcelain(output.replace(/\n$/, ''));
}

function diffPaths(from, to, pathspecs) {
    const output = git(['diff', '--name-only', '--diff-filter=ACDMRTUXB', from, to, '--', ...pathspecs]).trim();
    return output ? output.split('\n').filter(Boolean) : [];
}

function commitsTouchingCode(range) {
    const output = git(['log', range, `--pretty=format:%H%x1f%s%x1f%b%x1e`, '--', ...CODE_DIRS]).trim();
    if (!output) return [];
    return output
        .split('\x1e')
        .map((record) => record.trim())
        .filter(Boolean)
        .map((record) => {
            const [hash, subject, ...rest] = record.split('\x1f');
            return { hash, subject: subject ?? '', body: rest.join('\x1f') };
        });
}

function exempt(commit) {
    return `${commit.subject}\n${commit.body}`.includes('[no status]');
}

function reviewedHash(statusText) {
    const match = statusText.match(/\*\*Reviewed up to commit:\*\*\s*`([0-9a-fA-F]{7,40})`/);
    if (!match) {
        throw new Error(
            'STATUS.md is missing a line of the form **Reviewed up to commit:** `<hash>`.'
        );
    }
    const resolved = tryRev(match[1]);
    if (!resolved) {
        throw new Error(`Reviewed commit ${match[1]} does not resolve in this repository.`);
    }
    return resolved;
}

function isAncestor(ancestor, descendant) {
    try {
        execFileSync('git', ['merge-base', '--is-ancestor', ancestor, descendant], { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

function main() {
    const root = git(['rev-parse', '--show-toplevel']).trim();
    process.chdir(root);

    let statusText;
    try {
        statusText = readFileSync(STATUS_PATH, 'utf8');
    } catch {
        throw new Error('STATUS.md is missing from the repository root.');
    }

    const reviewed = reviewedHash(statusText);
    const head = git(['rev-parse', 'HEAD']).trim();
    const base = resolveBase();
    const mergeBase = git(['merge-base', base.hash, head]).trim();

    const failures = [];
    if (!isAncestor(reviewed, head)) {
        failures.push(`Reviewed commit ${reviewed} is not an ancestor of HEAD (${head}).`);
    }

    const workPaths = dirtyPaths(CODE_DIRS);
    const workCode = workPaths.filter(isCodePath);
    const workStatus = dirtyPaths([STATUS_PATH]).includes(STATUS_PATH);
    if (workCode.length && !workStatus) {
        failures.push(
            'Uncommitted application code changed without STATUS.md:\n' +
                workCode.map((file) => `  ${file}`).join('\n')
        );
    }

    const committedCode = diffPaths(mergeBase, head, CODE_DIRS).filter(isCodePath);
    const committedStatus = diffPaths(mergeBase, head, [STATUS_PATH]).includes(STATUS_PATH);
    if (committedCode.length && !committedStatus) {
        const uncovered = commitsTouchingCode(`${mergeBase}..${head}`).filter((commit) => !exempt(commit));
        if (uncovered.length) {
            failures.push(
                `Application code changed against ${base.ref} but STATUS.md did not.\n` +
                    'Commits missing [no status]:\n' +
                    uncovered.map((commit) => `  ${commit.hash.slice(0, 12)} ${commit.subject}`).join('\n')
            );
        }
    }

    const sinceReviewed = git(['log', `${reviewed}..${head}`, '--pretty=format:%h %s', '--', ...CODE_DIRS]).trim();
    const listed = sinceReviewed ? sinceReviewed.split('\n').filter(Boolean) : [];
    console.log(`Commits touching code since reviewed ${reviewed}:`);
    console.log(listed.length ? listed.map((line) => `  ${line}`).join('\n') : '  (none)');

    if (failures.length) {
        console.error(`status-check: failed (code directories: ${CODE_DIRS.join(', ')})`);
        console.error(failures.join('\n\n'));
        process.exit(1);
    }
    console.log(`status-check: ok (base ${base.ref})`);
}

try {
    main();
} catch (error) {
    console.error(`status-check: failed`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
}
