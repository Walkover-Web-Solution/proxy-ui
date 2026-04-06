import { INTL_INPUT_OPTION } from '@proxy/constant';
import { PHONE_NUMBER_REGEX } from '@proxy/regex';
declare var window;

export class IntlPhoneLib {
    private intl: any;
    private changeFlagZIndexInterval: any;
    private inputElement: any;
    /**
     * Creates an instance of IntlPhoneLib.
     * @param {*} inputElement
     * @param {*} parentDom
     * @memberof IntlPhoneLib
     */
    constructor(inputElement, parentDom, customCssStyleURL, changeFlagZIndex = false, intlOptions: object = {}) {
        this.inputElement = inputElement;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/intlTelInput.min.js';
        const initIntlTelInput = () => {
            this.intl = window.intlTelInput(inputElement, { ...INTL_INPUT_OPTION, ...intlOptions });
            this.checkMobileFlag(parentDom, changeFlagZIndex);
        };

        script.onload = () => initIntlTelInput();

        const intlStyleElement = document.createElement('link');
        intlStyleElement.rel = 'stylesheet';
        intlStyleElement.href = `https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/css/intlTelInput.css`;

        const customIntlStyleElement = document.createElement('link');
        customIntlStyleElement.rel = 'stylesheet';
        customIntlStyleElement.href = `${customCssStyleURL}`;

        if (parentDom) {
            parentDom.appendChild(script);
            parentDom.appendChild(intlStyleElement);
            parentDom.appendChild(customIntlStyleElement);
        }
        setTimeout(() => {
            document.head.appendChild(script);
            document.head.appendChild(intlStyleElement);
        }, 200);

        if (window.intlTelInput) {
            initIntlTelInput();
        }

        let ulEl = document.getElementById('iti-0__country-listbox');
        if (ulEl) {
            let flagEl = Array.from(document.getElementsByClassName('iti__flag') as HTMLCollectionOf<HTMLElement>);
            for (let i = 0; i < flagEl.length; i++) {
                flagEl[i].style.backgroundImage =
                    'url(https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/img/flags.png)';
            }
        }

        inputElement.addEventListener('keyup', () => {
            setTimeout(() => {
                if (this.isRequiredValidNumber) {
                    inputElement.classList.remove('invalid-input');
                } else {
                    inputElement.classList.add('invalid-input');
                }
            }, 100);
        });
        this.showCountryDropdown(inputElement, parentDom);
    }

    set phoneNumber(number: string) {
        this.intl?.setNumber(number);
    }

    set setCountry(country: string) {
        this.intl?.setCountry(country);
    }

    get intlData() {
        return this.intl;
    }

    get phoneNumber() {
        return this.intl?.getNumber();
    }

    get isRequiredValidNumber() {
        return this.intl?.isValidNumber();
    }

    get isValidNumber() {
        return this.intl?.getNumber()?.length ? this.intl?.isValidNumber() : true;
    }

    get selectedCountryData() {
        return this.intl?.getSelectedCountryData();
    }

    get getExtension() {
        return this.intl?.getExtension();
    }

    private checkMobileFlag(parentDom, changeFlagZIndex): void {
        let count = 0;
        let interval = setInterval(() => {
            let mobileViewInit = document.querySelector('body.iti-mobile');
            let childCount = 0;
            let flagDropDownElInterval = setInterval(() => {
                const itiWrapper = this.inputElement?.closest?.('.iti') || parentDom;
                let flagDropdownView = itiWrapper.querySelector('.iti__flag-container');
                if (changeFlagZIndex) {
                    this.changeFlagZIndexInterval = setInterval(() => {
                        let flagDropDown = document.querySelector('.iti--container');
                        flagDropDown?.setAttribute('style', 'z-index: 9999999');
                        if (flagDropDown) {
                            clearInterval(this.changeFlagZIndexInterval);
                        }
                    }, 100);
                }
                if (flagDropdownView || childCount > 10) {
                    clearInterval(flagDropDownElInterval);
                }
                childCount++;
            }, 200);
            count++;
            if (mobileViewInit || count > 5) {
                clearInterval(interval);
            }
        }, 200);
    }

    /**
     * showCountryDropdown in fixed position
     *
     * @private
     * @param {HTMLElement} inputElement
     * @param {HTMLElement} parentDom
     * @memberof IntlPhoneLib
     */
    private showCountryDropdown(inputElement: HTMLElement, parentDom: HTMLElement) {
        const getItiScope = () => inputElement?.closest?.('.iti') || parentDom;
        const attachListener = (attempt = 0) => {
            const itiScope = getItiScope();
            let flagContainer = itiScope.querySelector('.iti__flag-container');
            let flagDropdownView = itiScope.querySelector('.iti__country-list');
            if (flagDropdownView && flagContainer) {
                flagContainer.addEventListener('click', (event: PointerEvent) => {
                    const scope = getItiScope();
                    const btn = scope.querySelector('.iti__flag-container') as HTMLElement;
                    const list = scope.querySelector('.iti__country-list') as HTMLElement;
                    if (!btn || !list) return;
                    const rect = btn.getBoundingClientRect();
                    const top = rect.bottom;
                    const left = rect.left;
                    list.setAttribute(
                        'style',
                        'position: fixed; top:' + top + 'px; left:' + left + 'px; z-index: 9999;'
                    );
                });
            } else if (attempt < 20) {
                setTimeout(() => attachListener(attempt + 1), 200);
            }
        };
        setTimeout(() => attachListener(), 700);
    }

    public onlyPhoneNumber(e: KeyboardEvent): void {
        const inputChar = String.fromCharCode(e.charCode);
        if ((e.key !== 'Backspace' && !new RegExp(PHONE_NUMBER_REGEX).test(inputChar)) || e.code === 'Space') {
            e.preventDefault();
        }
    }

    public clearChangeFlagZIndexInterval() {
        clearInterval(this.changeFlagZIndexInterval);
    }

    public destroyIntlClass(): void {
        this.intl?.destroy();
    }
}
