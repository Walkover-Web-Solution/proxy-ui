const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { readFileSync, writeFileSync } = require('node:fs');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    encoding: 'utf8',
})
    .split('\0')
    .filter(Boolean)
    .sort();
const digest = createHash('sha256');
for (const file of files) {
    try {
        digest.update(file);
        digest.update(readFileSync(file));
    } catch {}
}
const sourceHash = digest.digest('hex').slice(0, 12);
const version = {
    version: '0.0.3',
    build: 'experience-refresh-' + sourceHash,
    baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    sourceHash,
    data: 'synthetic',
    liveApi: false,
};
writeFileSync('dist/review/browser/review-version.json', JSON.stringify(version, null, 2) + '\n');
process.stdout.write(JSON.stringify(version) + '\n');
