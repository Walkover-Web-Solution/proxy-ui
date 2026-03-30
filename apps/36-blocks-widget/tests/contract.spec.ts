/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Widget Public API Contract Tests
 *
 * These tests verify that the widget's public API contract remains stable:
 * - window.initVerification is a function
 * - <proxy-auth> custom element is registered
 * - Error handling for missing referenceId and success callback
 * - DOM rendering inside provided container
 *
 * Run after every widget build: npm run test:contract
 */

export {}; // make this file a module so the declare global works

declare global {
    interface Window {
        initVerification: any;
        __proxyAuth: any;
        __proxyAuthLoaded: boolean;
    }
}

describe('Widget Public API Contract', () => {
    it('should register window.initVerification as a function', () => {
        expect(window.initVerification).toBeDefined();
        expect(typeof window.initVerification).toBe('function');
    });

    it('should register <proxy-auth> custom element', () => {
        expect(customElements.get('proxy-auth')).toBeDefined();
    });

    it('should expose version metadata on window.__proxyAuth', () => {
        expect(window.__proxyAuth).toBeDefined();
        expect(window.__proxyAuth.version).toBeDefined();
        expect(typeof window.__proxyAuth.version).toBe('string');
        expect(window.__proxyAuth.buildTime).toBeDefined();
    });

    it('should throw if referenceId is missing', () => {
        expect(() => window.initVerification({})).toThrow('Reference Id is missing!');
    });

    it('should throw if success callback is missing', () => {
        const div = document.createElement('div');
        div.id = 'test-ref';
        document.body.appendChild(div);
        expect(() => window.initVerification({ referenceId: 'test-ref' })).toThrow('success callback function missing');
        div.remove();
    });

    it('should render <proxy-auth> inside provided container', async () => {
        const div = document.createElement('div');
        div.id = 'render-test';
        document.body.appendChild(div);
        window.initVerification({
            referenceId: 'render-test',
            success: () => {},
        });

        // Stable polling — avoids flaky setTimeout in CI
        const waitForElement = (container: Element, selector: string, timeout = 2000) =>
            new Promise<Element>((resolve, reject) => {
                const start = Date.now();
                const interval = setInterval(() => {
                    const el = container.querySelector(selector);
                    if (el) {
                        clearInterval(interval);
                        resolve(el);
                    } else if (Date.now() - start > timeout) {
                        clearInterval(interval);
                        reject(new Error(`${selector} not found within ${timeout}ms`));
                    }
                }, 20);
            });

        const el = await waitForElement(div, 'proxy-auth');
        expect(el).not.toBeNull();
        div.remove();
    });
});
