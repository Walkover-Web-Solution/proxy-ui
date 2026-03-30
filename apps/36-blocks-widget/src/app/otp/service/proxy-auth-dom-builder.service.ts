import { Injectable, Renderer2 } from '@angular/core';
import { WidgetTheme } from '@proxy/constant';

@Injectable({ providedIn: 'root' })
export class ProxyAuthDomBuilderService {
    createLogoElement(renderer: Renderer2, logoUrl: string): HTMLElement | null {
        if (!logoUrl) return null;
        const wrapper: HTMLElement = renderer.createElement('div');
        wrapper.style.cssText = 'width:316px;display:flex;justify-content:center;margin:0 8px 12px 8px;';
        const img: HTMLImageElement = renderer.createElement('img');
        img.src = logoUrl;
        img.alt = 'Logo';
        img.loading = 'lazy';
        img.style.cssText = 'max-height:48px;max-width:200px;object-fit:contain;';
        renderer.appendChild(wrapper, img);
        return wrapper;
    }

    appendSkeletonLoader(renderer: Renderer2, element: HTMLElement): void {
        if (element.querySelector('#skeleton-loader')) return;
        const container = renderer.createElement('div');
        container.id = 'skeleton-loader';
        container.style.cssText = 'display:block;width:100%;';
        if (!document.getElementById('skeleton-animation')) {
            const style = renderer.createElement('style');
            style.id = 'skeleton-animation';
            style.textContent =
                '@keyframes skeleton-loading{0%{background-position:200% 0}100%{background-position:-200% 0}}';
            document.head.appendChild(style);
        }
        for (let i = 0; i < 3; i++) {
            const bone = renderer.createElement('div');
            bone.style.cssText =
                'width:230px;height:40px;background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);background-size:200% 100%;animation:skeleton-loading 1.5s infinite;border-radius:4px;margin:8px 8px 16px 8px;display:block;box-sizing:border-box;';
            renderer.appendChild(container, bone);
        }
        renderer.appendChild(element, container);
    }

    removeSkeletonLoader(renderer: Renderer2, element: HTMLElement): void {
        element.querySelectorAll('#skeleton-loader').forEach((loader) => {
            if (loader.parentNode) renderer.removeChild(element, loader);
        });
        this.forceRemoveAllSkeletonLoaders(renderer, element);
    }

    forceRemoveAllSkeletonLoaders(renderer: Renderer2, referenceElement: HTMLElement | null): void {
        if (referenceElement) {
            referenceElement.querySelectorAll('#skeleton-loader').forEach((loader) => {
                renderer.removeChild(referenceElement, loader);
            });
        }
        document.querySelectorAll('#skeleton-loader').forEach((loader) => {
            if (loader.parentNode) loader.parentNode.removeChild(loader);
        });
    }

    addPasswordVisibilityToggle(
        renderer: Renderer2,
        input: HTMLInputElement,
        container: HTMLElement,
        theme: string
    ): void {
        let visible = false;
        const iconColor = theme === WidgetTheme.Dark ? '#e5e7eb' : '#5d6164';
        const toggleBtn: HTMLButtonElement = renderer.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.style.cssText =
            'position:absolute;right:12px;top:50%;transform:translateY(-50%);border:none;background:transparent;cursor:pointer;padding:0;margin:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;z-index:1;';
        const hiddenIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M12.01 20c-5.065 0-9.586-4.211-12.01-8.424 2.418-4.103 6.943-7.576 12.01-7.576 5.135 0 9.635 3.453 11.999 7.564-2.241 4.43-6.726 8.436-11.999 8.436zm-10.842-8.416c.843 1.331 5.018 7.416 10.842 7.416 6.305 0 10.112-6.103 10.851-7.405-.772-1.198-4.606-6.595-10.851-6.595-6.116 0-10.025 5.355-10.842 6.584zm10.832-4.584c2.76 0 5 2.24 5 5s-2.24 5-5 5-5-2.24-5-5 2.24-5 5-5zm0 1c-2.208 0-4 1.792-4 4s1.792 4 4 4 4-1.792 4-4-1.792-4-4-4z"/></svg>`;
        const visibleIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="${iconColor}" xmlns="http://www.w3.org/2000/svg" style="display:block"><path d="M8.137 15.147c-.71-.857-1.146-1.947-1.146-3.147 0-2.76 2.241-5 5-5 1.201 0 2.291.435 3.148 1.145l1.897-1.897c-1.441-.738-3.122-1.248-5.035-1.248-6.115 0-10.025 5.355-10.842 6.584.529.834 2.379 3.527 5.113 5.428l1.865-1.865zm6.294-6.294c-.673-.53-1.515-.853-2.44-.853-2.207 0-4 1.792-4 4 0 .923.324 1.765.854 2.439l5.586-5.586zm7.56-6.146l-19.292 19.293-.708-.707 3.548-3.548c-2.298-1.612-4.234-3.885-5.548-6.169 2.418-4.103 6.943-7.576 12.01-7.576 2.065 0 4.021.566 5.782 1.501l3.501-3.501.707.707zm-2.465 3.879l-.734.734c2.236 1.619 3.628 3.604 4.061 4.274-.739 1.303-4.546 7.406-10.852 7.406-1.425 0-2.749-.368-3.951-.938l-.748.748c1.475.742 3.057 1.19 4.699 1.19 5.274 0 9.758-4.006 11.999-8.436-1.087-1.891-2.63-3.637-4.474-4.978zm-3.535 5.414c0-.554-.113-1.082-.317-1.562l.734-.734c.361.69.583 1.464.583 2.296 0 2.759-2.24 5-5 5-.832 0-1.604-.223-2.295-.583l.734-.735c.48.204 1.007.318 1.561.318 2.208 0 4-1.792 4-4z"/></svg>`;
        const renderIcon = () => {
            toggleBtn.innerHTML = visible ? visibleIcon : hiddenIcon;
        };
        renderIcon();
        toggleBtn.addEventListener('click', () => {
            visible = !visible;
            input.type = visible ? 'text' : 'password';
            renderIcon();
        });
        renderer.appendChild(container, toggleBtn);
    }

    inputStyle(theme: string, borderRadius: string, paddingRight = false): string {
        const isDark = theme === WidgetTheme.Dark;
        return `width:100%;height:44px;padding:0 ${paddingRight ? '44px' : '16px'} 0 16px;border:1px solid ${
            isDark ? '#ffffff' : '#cbd5e1'
        };border-radius:${borderRadius};background:${isDark ? 'transparent' : '#ffffff'};color:${
            isDark ? '#ffffff' : '#1f2937'
        };font-size:14px;outline:none;box-sizing:border-box;`;
    }

    setInlineError(errorEl: HTMLElement, message: string): void {
        errorEl.textContent = message;
        errorEl.style.display = message ? 'block' : 'none';
    }

    createErrorElement(renderer: Renderer2): HTMLElement {
        const el: HTMLElement = renderer.createElement('div');
        el.style.cssText = 'color:#d14343;font-size:14px;min-height:16px;display:none;margin-top:-4px;';
        return el;
    }

    createBackButton(renderer: Renderer2): HTMLButtonElement {
        const btn: HTMLButtonElement = renderer.createElement('button');
        btn.type = 'button';
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#5f6368"><path d="M400-80 0-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>`;
        btn.style.cssText =
            'background:transparent;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;margin-bottom:8px;';
        return btn;
    }

    createOrDivider(renderer: Renderer2, primaryColor: string): HTMLElement {
        const container: HTMLElement = renderer.createElement('div');
        container.setAttribute('data-or-divider', 'true');
        container.style.cssText = 'display:flex;align-items:center;margin:8px 8px 12px 8px;width:316px;';
        const lineStyle = 'flex:1;height:1px;background-color:#e0e0e0;';
        const left: HTMLElement = renderer.createElement('div');
        left.style.cssText = lineStyle;
        const right: HTMLElement = renderer.createElement('div');
        right.style.cssText = lineStyle;
        const text: HTMLElement = renderer.createElement('span');
        text.textContent = 'Or continue with';
        text.style.cssText = `padding:0 12px;font-size:12px;color:${primaryColor};font-weight:500;letter-spacing:0.5px;`;
        renderer.appendChild(container, left);
        renderer.appendChild(container, text);
        renderer.appendChild(container, right);
        return container;
    }
}
