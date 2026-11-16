const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { test } = require('node:test');

test('tools/set-env.js reads public build-time convention without hardcoded defaults', () => {
    const setEnvSource = readFileSync('tools/set-env.js', 'utf8');
    assert.match(setEnvSource, /STEWARD_FEEDBACK_URL/);
    assert.match(setEnvSource, /STEWARD_FEEDBACK_KEY/);
    assert.match(setEnvSource, /NEXT_PUBLIC_/);
    assert.match(setEnvSource, /VITE_/);
    assert.match(setEnvSource, /REACT_APP_/);
    // Must NOT hardcode the key or URL, not even as defaults
    assert.doesNotMatch(setEnvSource, /https:\/\/steward\.embarko\.app\/api\/v1\/feedback/);
    assert.doesNotMatch(setEnvSource, /pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e/);
});

test('.env.example includes Steward feedback environment variables with placeholder values', () => {
    const envExample = readFileSync('.env.example', 'utf8');
    assert.match(envExample, /STEWARD_FEEDBACK_URL\s*=\s*'STEWARD_FEEDBACK_URL'/);
    assert.match(envExample, /STEWARD_FEEDBACK_KEY\s*=\s*'STEWARD_FEEDBACK_KEY'/);
    // Must NOT hardcode the live key or URL
    assert.doesNotMatch(envExample, /https:\/\/steward\.embarko\.app\/api\/v1\/feedback/);
    assert.doesNotMatch(envExample, /pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e/);
});

test('docs/environment.md documents STEWARD_FEEDBACK_URL and STEWARD_FEEDBACK_KEY', () => {
    const envDocs = readFileSync('docs/environment.md', 'utf8');
    assert.match(envDocs, /STEWARD_FEEDBACK_URL/);
    assert.match(envDocs, /STEWARD_FEEDBACK_KEY/);
    assert.doesNotMatch(envDocs, /defaults to `https:\/\/steward\.embarko\.app/);
    assert.doesNotMatch(envDocs, /pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e/);
});

test('README.md notes optional Steward feedback environment configuration', () => {
    const readme = readFileSync('README.md', 'utf8');
    assert.match(readme, /STEWARD_FEEDBACK_URL/);
    assert.match(readme, /STEWARD_FEEDBACK_KEY/);
});

test('sidebar in layout.component.html has Feedback item guarded by isAvailable()', () => {
    const html = readFileSync('apps/36-blocks/src/app/panel/layout/layout.component.html', 'utf8');
    assert.match(html, /@if\s*\(feedbackService\.isAvailable\(\)\)/);
    assert.match(html, /sidebar-feedback-link/);
    assert.match(html, /openFeedback\(\)/);
    assert.match(html, /!sideNavService\.isSideNavOpen\(\)\s*\?\s*'Feedback'\s*:\s*''/);
    assert.match(html, />feedback<\/mat-icon>/);

    const scss = readFileSync('apps/36-blocks/src/app/panel/layout/layout.component.scss', 'utf8');
    assert.match(scss, /\.sidebar-feedback-link/);
    assert.match(scss, /\.sidebar-feedback-link__btn/);
});

test('floating button component guards visibility with isAvailable()', () => {
    const ts = readFileSync(
        'apps/36-blocks/src/app/panel/feedback/feedback-floating-button/feedback-floating-button.component.ts',
        'utf8'
    );
    assert.match(ts, /this\.feedbackService\.isAvailable\(\)\s*&&\s*!this\.feedbackService\.isSidebarPresent\(\)/);

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

test('feedback API service correctly structures request payload and headers without hardcoded fallbacks', async () => {
    const serviceSource = readFileSync('apps/36-blocks/src/app/panel/feedback/feedback-api.service.ts', 'utf8');
    assert.match(serviceSource, /X-Steward-Key/);
    assert.match(serviceSource, /application\/json/);
    assert.match(serviceSource, /app_version/);
    assert.match(serviceSource, /202/);
    assert.match(serviceSource, /429/);
    assert.match(serviceSource, /Too many at once\. Please try again shortly\./);

    // Must NOT hardcode the key or URL in service
    assert.doesNotMatch(serviceSource, /https:\/\/steward\.embarko\.app\/api\/v1\/feedback/);
    assert.doesNotMatch(serviceSource, /pk_7109b673ade5f6aefc2eb0a1dfbcee1c4a2e/);
});

test('feedback service isConfigured() checks for valid non-placeholder values', () => {
    const serviceSource = readFileSync('apps/36-blocks/src/app/panel/feedback/feedback.service.ts', 'utf8');
    assert.match(serviceSource, /isConfigured\(\)/);
    assert.match(serviceSource, /isAvailable\(\)/);
    assert.match(serviceSource, /STEWARD_FEEDBACK_URL/);
    assert.match(serviceSource, /STEWARD_FEEDBACK_KEY/);
});
