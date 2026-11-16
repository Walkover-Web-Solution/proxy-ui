const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');

test('tools/set-env.js includes default Steward feedback URL, key, and app version', () => {
    const setEnvSource = readFileSync('tools/set-env.js', 'utf8');
    assert.match(setEnvSource, /STEWARD_FEEDBACK_URL/);
    assert.match(setEnvSource, /STEWARD_FEEDBACK_KEY/);
    assert.match(setEnvSource, /https:\/\/steward\.embarko\.app\/api\/v1\/feedback/);
    assert.match(setEnvSource, /pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e/);
    assert.match(setEnvSource, /appVersion/);
});

test('.env.example includes Steward feedback environment variables', () => {
    const envExample = readFileSync('.env.example', 'utf8');
    assert.match(envExample, /STEWARD_FEEDBACK_URL\s*=\s*'https:\/\/steward\.embarko\.app\/api\/v1\/feedback'/);
    assert.match(envExample, /STEWARD_FEEDBACK_KEY\s*=\s*'pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e'/);
});

test('docs/environment.md documents STEWARD_FEEDBACK_URL and STEWARD_FEEDBACK_KEY', () => {
    const envDocs = readFileSync('docs/environment.md', 'utf8');
    assert.match(envDocs, /STEWARD_FEEDBACK_URL/);
    assert.match(envDocs, /STEWARD_FEEDBACK_KEY/);
});

test('sidebar in layout.component.html has Feedback item with correct styling and tooltip', () => {
    const html = readFileSync('apps/36-blocks/src/app/panel/layout/layout.component.html', 'utf8');
    assert.match(html, /sidebar-feedback-link/);
    assert.match(html, /openFeedback\(\)/);
    assert.match(html, /!sideNavService\.isSideNavOpen\(\)\s*\?\s*'Feedback'\s*:\s*''/);
    assert.match(html, />feedback<\/mat-icon>/);

    const scss = readFileSync('apps/36-blocks/src/app/panel/layout/layout.component.scss', 'utf8');
    assert.match(scss, /\.sidebar-feedback-link/);
    assert.match(scss, /\.sidebar-feedback-link__btn/);
});

test('app.component.html hosts proxy-feedback-floating-button', () => {
    const html = readFileSync('apps/36-blocks/src/app/app.component.html', 'utf8');
    assert.match(html, /<proxy-feedback-floating-button><\/proxy-feedback-floating-button>/);
});

test('feedback dialog template satisfies acceptance criteria', () => {
    const html = readFileSync(
        'apps/36-blocks/src/app/panel/feedback/feedback-dialog/feedback-dialog.component.html',
        'utf8'
    );
    // Must have ONE textarea
    const textareaMatches = html.match(/<textarea/g);
    assert.equal(textareaMatches.length, 1);
    // Must have success state with exact text
    assert.match(html, /Thanks,\s*we\s*got\s*it/);
    // Must have loading state with spinner
    assert.match(html, /mat-spinner/);
    assert.match(html, /Sending…/);
    // Must have error state
    assert.match(html, /errorMessage\(\)/);
});

test('feedback API service correctly structures request payload and headers', async () => {
    const serviceSource = readFileSync('apps/36-blocks/src/app/panel/feedback/feedback-api.service.ts', 'utf8');
    assert.match(serviceSource, /X-Steward-Key/);
    assert.match(serviceSource, /application\/json/);
    assert.match(serviceSource, /app_version/);
    assert.match(serviceSource, /202/);
    assert.match(serviceSource, /429/);
    assert.match(serviceSource, /Too many at once\. Please try again shortly\./);
});
