/**
 * Copies text to the clipboard. Resolves true on success, false when both the async Clipboard API and the
 * selection fallback are unavailable or refused. Safe to call during server rendering (resolves false).
 */
export async function copyText(text: string): Promise<boolean> {
    try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // Fall through to the selection fallback (insecure context, denied permission).
    }
    return copyWithSelectionFallback(text);
}

// Used when the async Clipboard API is unavailable (insecure context, older browsers, denied permission).
function copyWithSelectionFallback(text: string): boolean {
    if (typeof document === 'undefined') {
        return false;
    }
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(field);
    field.select();
    try {
        return document.execCommand('copy');
    } catch {
        return false;
    } finally {
        field.remove();
    }
}
