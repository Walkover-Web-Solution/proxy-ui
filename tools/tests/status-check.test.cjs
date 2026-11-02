const assert = require('node:assert/strict');
const { execFileSync, spawnSync } = require('node:child_process');
const { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const script = path.resolve(__dirname, '../../scripts/status-check.mjs');

function header(hash) {
    return `**Plan:** Test · **Last updated:** 2026-11-02 · **Reviewed up to commit:** \`${hash}\`\n`;
}

function makeRepo() {
    const cwd = mkdtempSync(path.join(tmpdir(), 'status-check-'));
    const git = (args) =>
        execFileSync(
            'git',
            ['-c', 'user.name=Status Check', '-c', 'user.email=status-check@example.com', '-c', 'commit.gpgsign=false', ...args],
            { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
        );
    git(['init', '-b', 'stage']);
    mkdirSync(path.join(cwd, 'apps'));
    writeFileSync(path.join(cwd, 'apps', 'keep.ts'), 'export const kept = true;\n');
    const placeholder = '0000000000000000000000000000000000000000';
    writeFileSync(path.join(cwd, 'STATUS.md'), header(placeholder));
    git(['add', '.']);
    git(['commit', '-m', 'init']);
    const reviewed = git(['rev-parse', 'HEAD']).trim();
    writeFileSync(path.join(cwd, 'STATUS.md'), header(reviewed));
    git(['add', 'STATUS.md']);
    git(['commit', '-m', 'record status']);
    git(['branch', 'base']);
    return {
        cwd,
        git,
        reviewed,
        cleanup: () => rmSync(cwd, { recursive: true, force: true }),
    };
}

function run(cwd) {
    return spawnSync(process.execPath, [script], {
        cwd,
        encoding: 'utf8',
        env: { ...process.env, STATUS_BASE: 'base' },
    });
}

test('a clean tree passes and lists no code commits after the reviewed hash', () => {
    const repo = makeRepo();
    try {
        const result = run(repo.cwd);
        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /status-check: ok/);
        assert.match(result.stdout, new RegExp(`Commits touching code since reviewed ${repo.reviewed}:\\n  \\(none\\)`));
    } finally {
        repo.cleanup();
    }
});

test('an uncommitted code edit fails until STATUS.md changes too', () => {
    const repo = makeRepo();
    try {
        writeFileSync(path.join(repo.cwd, 'apps', 'new.ts'), 'export const added = true;\n');
        const failed = run(repo.cwd);
        assert.equal(failed.status, 1);
        assert.match(failed.stderr, /apps\/new\.ts/);
        assert.match(failed.stdout, /\(none\)/);

        const statusPath = path.join(repo.cwd, 'STATUS.md');
        writeFileSync(statusPath, readFileSync(statusPath, 'utf8') + '\nUpdated.\n');
        const passed = run(repo.cwd);
        assert.equal(passed.status, 0, passed.stderr);
    } finally {
        repo.cleanup();
    }
});

test('a code commit without STATUS.md fails, and [no status] is an intentional skip', () => {
    const repo = makeRepo();
    try {
        writeFileSync(path.join(repo.cwd, 'apps', 'screen.ts'), 'export const screen = true;\n');
        repo.git(['add', 'apps/screen.ts']);
        repo.git(['commit', '-m', 'add screen']);
        const failed = run(repo.cwd);
        assert.equal(failed.status, 1);
        assert.match(failed.stderr, /add screen/);

        repo.git(['reset', '--hard', 'base']);
        writeFileSync(path.join(repo.cwd, 'apps', 'screen.ts'), 'export const screen = true;\n');
        repo.git(['add', 'apps/screen.ts']);
        repo.git(['commit', '-m', 'add screen', '-m', 'Skip the scorecard [no status]']);
        const passed = run(repo.cwd);
        assert.equal(passed.status, 0, passed.stderr);
        assert.match(passed.stdout, /add screen/);
    } finally {
        repo.cleanup();
    }
});

test('a later commit that updates STATUS.md covers an earlier code commit', () => {
    const repo = makeRepo();
    try {
        writeFileSync(path.join(repo.cwd, 'apps', 'screen.ts'), 'export const screen = true;\n');
        repo.git(['add', 'apps/screen.ts']);
        repo.git(['commit', '-m', 'add screen']);
        const statusPath = path.join(repo.cwd, 'STATUS.md');
        writeFileSync(statusPath, readFileSync(statusPath, 'utf8') + '\nScreen row updated.\n');
        repo.git(['add', 'STATUS.md']);
        repo.git(['commit', '-m', 'record the screen']);
        const result = run(repo.cwd);
        assert.equal(result.status, 0, result.stderr);
        assert.match(result.stdout, /add screen/);
    } finally {
        repo.cleanup();
    }
});
