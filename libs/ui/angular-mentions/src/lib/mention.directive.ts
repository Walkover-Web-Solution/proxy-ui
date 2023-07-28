import {
    ApplicationRef,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    ElementRef,
    Injector,
    OnDestroy,
    TemplateRef,
    ViewContainerRef,
} from '@angular/core';
import { EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { getCaretPosition, getValue, insertValue, setCaretPosition } from './mention-utils';

import { MentionConfig } from './mention-config';
import { MentionListComponent } from './mention-list.component';

const KEY_BACKSPACE = 8;
const KEY_TAB = 9;
const KEY_ENTER = 13;
const KEY_SHIFT = 16;
const KEY_ESCAPE = 27;
const KEY_SPACE = 32;
const KEY_LEFT = 37;
const KEY_UP = 38;
const KEY_RIGHT = 39;
const KEY_DOWN = 40;
const KEY_BUFFERED = 229;

/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2017 Dan MacFarlane
 */
@Directive({
    selector: '[mention], [mentionConfig]',
    host: {
        '(keydown)': 'keyHandler($event)',
        '(input)': 'inputHandler($event)',
        '(blur)': 'blurHandler($event)',
        'autocomplete': 'off',
    },
})
export class MentionDirective implements OnChanges, OnDestroy {
    // stores the items passed to the mentions directive and used to populate the root items in mentionConfig
    private mentionItems: any[];
    private mentionContent: any[];

    @Input('mention') set mention(items: any[]) {
        this.mentionItems = items;
    }

    @Input('mentionCont') set mentionCont(items: any[]) {
        this.mentionContent = items;
    }

    @Input() addSelectedInField: boolean = true;

    // the provided configuration object
    @Input() mentionConfig: MentionConfig = { items: [] };

    @Input() hideListIfEmpty: boolean = false;

    @Input() closeList: boolean = false;

    private activeConfig: MentionConfig;

    private DEFAULT_CONFIG: MentionConfig = {
        items: [],
        triggerChar: '@',
        labelKey: 'label',
        maxItems: -1,
        allowSpace: false,
        returnTrigger: false,
        mentionSelect: (item: any, triggerChar?: string) => {
            return item ? this.activeConfig.triggerChar + item[this.activeConfig.labelKey] : '';
        },
        mentionFilter: (searchString: string, items: any[]) => {
            const searchStringLowerCase = searchString?.toLowerCase();
            return items.filter((e) => e[this.activeConfig.labelKey]?.toLowerCase().startsWith(searchStringLowerCase));
        },
    };

    // template to use for rendering list items
    @Input() mentionListTemplate: TemplateRef<any>;

    // event emitted whenever the search term changes
    @Output() searchTerm = new EventEmitter<string>();

    // event emitted when an item is selected
    @Output() itemSelected = new EventEmitter<any>();

    // event emitted whenever the mention list is opened or closed
    @Output() opened = new EventEmitter<string>();
    @Output() closed = new EventEmitter();

    private triggerChars: { [key: string]: MentionConfig } = {};

    private searchString: string;
    private startPos: number;
    private startNode;
    private searchList: MentionListComponent;
    private searching: boolean;
    private iframe: any; // optional
    private lastKeyCode: number;
    private componentRef?: ComponentRef<MentionListComponent>;

    constructor(
        private _element: ElementRef,
        private _componentResolver: ComponentFactoryResolver,
        private _viewContainerRef: ViewContainerRef,
        private app: ApplicationRef,
        private injector: Injector
    ) {}

    ngOnChanges(changes: SimpleChanges) {
        // console.log('config change', changes);
        if (changes['mention'] || changes['mentionConfig']) {
            this.updateConfig();
        }
        if (changes['closeList']) {
            if (this.closeList && this.searchList) {
                this.searchList['hidden'] = true;
                this.closed.emit();
            }
        }
    }

    ngOnDestroy() {
        if (this.componentRef) {
            this.app.detachView(this.componentRef.hostView);
        }
    }

    public updateConfig() {
        if (this.mentionConfig) {
            const config = this.mentionConfig;
            this.triggerChars = {};
            // use items from directive if they have been set
            if (this.mentionItems) {
                config.items = this.mentionItems;
            }
            // nested configs
            if (config.mentions) {
                config.mentions.forEach((config) => this.addConfig(config));
            } else {
                this.addConfig(config);
            }
        }
    }

    private subjectSelect(subject: any) {
        let mess;
        if (this.activeConfig.triggerChar === '#') {
            this.mentionContent.forEach((ele) => {
                if (ele.subject === subject) {
                    mess = ele.reply_message;
                }
            });
        } else if (this.activeConfig.triggerChar === '@') {
            mess = '@' + subject + ' ';
        }
        return mess;
    }

    // add configuration for a trigger char
    private addConfig(config: MentionConfig) {
        // defaults
        const defaults = Object.assign({}, this.DEFAULT_CONFIG);
        config = Object.assign(defaults, config);
        // items
        let items = config.items;
        if (items && items.length > 0) {
            // convert strings to objects
            if (typeof items[0] === 'string') {
                items = items.map((label) => {
                    const object = {};
                    object[config.labelKey] = label;
                    return object;
                });
            }
            if (config.labelKey) {
                // remove items without an labelKey (as it's required to filter the list)
                items = items.filter((e) => e[config.labelKey]);
                if (!config.disableSort) {
                    items.sort((a, b) => a[config.labelKey].localeCompare(b[config.labelKey]));
                }
            }
        }
        config.items = items;

        // add the config
        this.triggerChars[config.triggerChar] = config;

        // for async update while menu/search is active
        if (this.activeConfig && this.activeConfig.triggerChar === config.triggerChar) {
            this.activeConfig = config;
            this.updateSearchList();
        }
    }

    setIframe(iframe: HTMLIFrameElement) {
        this.iframe = iframe;
    }

    stopEvent(event: any) {
        //if (event instanceof KeyboardEvent) { // does not work for iframe
        if (!event.wasClick) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }

    blurHandler(event: any) {
        this.stopEvent(event);
        this.stopSearch();
    }

    inputHandler(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
        if (this.lastKeyCode === KEY_BUFFERED && event.data) {
            const keyCode = event.data.charCodeAt(0);
            this.keyHandler({ keyCode, inputEvent: true }, nativeElement);
        }
    }

    // @param nativeElement is the alternative text element in an iframe scenario
    keyHandler(event: any, nativeElement: HTMLInputElement = this._element.nativeElement) {
        this.lastKeyCode = event.keyCode;

        if (event.isComposing || event.keyCode === KEY_BUFFERED) {
            return;
        }

        const val: string = getValue(nativeElement);
        let pos = getCaretPosition(nativeElement, this.iframe);
        let charPressed = event.key;
        if (!charPressed) {
            const charCode = event.which || event.keyCode;
            if (!event.shiftKey && charCode >= 65 && charCode <= 90) {
                charPressed = String.fromCharCode(charCode + 32);
            }
            // else if (event.shiftKey && charCode === KEY_2) {
            //   charPressed = this.config.triggerChar;
            // }
            else {
                // TODO (dmacfarlane) fix this for non-alpha keys
                // http://stackoverflow.com/questions/2220196/how-to-decode-character-pressed-from-jquerys-keydowns-event-handler?lq=1
                charPressed = String.fromCharCode(event.which || event.keyCode);
            }
        }
        if (event.keyCode === KEY_ENTER && event.wasClick && pos < this.startPos) {
            // put caret back in position prior to contenteditable menu click
            pos = this.startNode.length;
            setCaretPosition(this.startNode, pos, this.iframe);
        }
        //console.log('keyHandler', this.startPos, pos, val, charPressed, event);

        const config = this.triggerChars[charPressed];
        if (config) {
            this.activeConfig = config;
            this.startPos = event.inputEvent ? pos - 1 : pos;
            this.startNode = (
                this.iframe ? this.iframe.contentWindow.getSelection() : window.getSelection()
            ).anchorNode;
            this.searching = true;
            this.searchString = null;
            this.showSearchList(nativeElement);
            this.updateSearchList();

            if (config.returnTrigger) {
                this.searchTerm.emit(config.triggerChar);
            }
        } else if (this.startPos >= 0 && this.searching) {
            if (pos <= this.startPos && this.searchList) {
                this.searchList['hidden'] = true;
            }
            // ignore shift when pressed alone, but not when used with another key
            else if (
                event.keyCode !== KEY_SHIFT &&
                !event.metaKey &&
                !event.altKey &&
                !event.ctrlKey &&
                pos > this.startPos
            ) {
                if (!this.activeConfig.allowSpace && event.keyCode === KEY_SPACE) {
                    this.startPos = -1;
                    this.stopSearch();
                } else if (event.keyCode === KEY_BACKSPACE && pos > 0) {
                    pos--;
                    if (pos === this.startPos) {
                        this.stopSearch();
                    }
                } else if (this.searchList?.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopSearch();
                        return;
                    }
                } else if (!this.searchList?.hidden) {
                    if (event.keyCode === KEY_TAB || event.keyCode === KEY_ENTER) {
                        this.stopEvent(event);
                        // emit the selected list item
                        this.itemSelected.emit(this.searchList.activeItem);
                        // optional function to format the selected item before inserting the text
                        let text;
                        if (this.mentionContent && this.mentionContent.length > 0) {
                            text = this.addSelectedInField
                                ? this.subjectSelect(this.searchList.activeItem[this.activeConfig.labelKey])
                                : '';
                        } else {
                            text = this.searchList.activeItem
                                ? this.activeConfig.mentionSelect(this.searchList.activeItem)
                                : `${this.searchString}`;
                        }
                        // value is inserted without a trailing space for consistency
                        // between element types (div and iframe do not preserve the space)
                        insertValue(nativeElement, this.startPos, pos, text, this.iframe);
                        // fire input event so angular bindings are updated
                        if ('createEvent' in document) {
                            const evt = document.createEvent('HTMLEvents');
                            if (this.iframe) {
                                // a 'change' event is required to trigger tinymce updates
                                evt.initEvent('change', true, false);
                            } else {
                                evt.initEvent('input', true, false);
                            }
                            // this seems backwards, but fire the event from this elements nativeElement (not the
                            // one provided that may be in an iframe, as it won't be propogate)
                            this._element.nativeElement.dispatchEvent(evt);
                        }
                        this.startPos = -1;
                        this.stopSearch();
                        return false;
                    } else if (event.keyCode === KEY_ESCAPE) {
                        this.stopEvent(event);
                        this.stopSearch();
                        return false;
                    } else if (event.keyCode === KEY_DOWN) {
                        this.stopEvent(event);
                        this.searchList.activateNextItem();
                        return false;
                    } else if (event.keyCode === KEY_UP) {
                        this.stopEvent(event);
                        this.searchList.activatePreviousItem();
                        return false;
                    }
                }

                if (charPressed.length !== 1 && event.keyCode !== KEY_BACKSPACE) {
                    this.stopEvent(event);
                    return false;
                } else if (this.searching) {
                    let mention = val.substring(this.startPos + 1, pos);
                    if (event.keyCode !== KEY_BACKSPACE && !event.inputEvent) {
                        mention += charPressed;
                    }
                    this.searchString = mention;
                    if (this.activeConfig.returnTrigger) {
                        const triggerChar =
                            this.searchString || event.keyCode === KEY_BACKSPACE
                                ? val.substring(this.startPos, this.startPos + 1)
                                : '';
                        this.searchTerm.emit(triggerChar + this.searchString);
                    } else {
                        this.searchTerm.emit(this.searchString);
                    }
                    this.updateSearchList();
                }
            }
        }
    }

    // exposed for external calls to open the mention list, e.g. by clicking a button
    public startSearch(triggerChar?: string, nativeElement: HTMLInputElement = this._element.nativeElement) {
        triggerChar = triggerChar || this.mentionConfig.triggerChar || this.DEFAULT_CONFIG.triggerChar;
        const pos = getCaretPosition(nativeElement, this.iframe);
        insertValue(nativeElement, pos, pos, triggerChar, this.iframe);
        this.keyHandler({ key: triggerChar, inputEvent: true }, nativeElement);
    }

    stopSearch() {
        if (this.searchList && !this.searchList?.hidden) {
            this.searchList['hidden'] = true;
            setTimeout(() => this.closed.emit(), 200);
        }
        this.activeConfig = null;
        this.searching = false;
    }

    updateSearchList() {
        let matches: any[] = [];
        if (this.activeConfig && this.activeConfig.items) {
            let objects = this.activeConfig.items;
            // disabling the search relies on the async operation to do the filtering
            if (!this.activeConfig.disableSearch && this.searchString && this.activeConfig.labelKey) {
                if (this.activeConfig.mentionFilter) {
                    objects = this.activeConfig.mentionFilter(this.searchString, objects);
                }
            }
            matches = objects;
            if (this.activeConfig.maxItems > 0) {
                matches = matches.slice(0, this.activeConfig.maxItems);
            }
        }
        // update the search list
        if (this.searchList) {
            this.searchList.items = matches;
            // this.searchList.hidden = matches.length === 0;
            if (matches.length === 0) {
                if (this.hideListIfEmpty && this.searchList) {
                    this.searchList['hidden'] = true;
                    this.closed.emit();
                }
            } else {
                if (this.searchList) {
                    this.searchList['hidden'] = false;
                    this.opened.emit(this.activeConfig.triggerChar);
                }
            }
            window.requestAnimationFrame(() => this.searchList.checkBounds());
        }
    }

    showSearchList(nativeElement: HTMLInputElement) {
        this.opened.emit(this.activeConfig.triggerChar);

        if (this.searchList == null) {
            const componentFactory = this._componentResolver.resolveComponentFactory(MentionListComponent);
            let componentRef: ComponentRef<MentionListComponent>;
            if (this.activeConfig.container === 'body') {
                const containerElement = document.createElement('div');
                document.body.append(containerElement);
                componentRef = componentFactory.create(this.injector, [], containerElement);
                this.app.attachView(componentRef.hostView);
                this.componentRef = componentRef;
            } else {
                componentRef = this._viewContainerRef.createComponent(componentFactory);
            }

            this.searchList = componentRef.instance;
            this.searchList.itemTemplate = this.mentionListTemplate;
            componentRef.instance.itemClick.subscribe(() => {
                nativeElement.focus();
                const fakeKeydown = { key: 'Enter', keyCode: KEY_ENTER, wasClick: true };
                this.keyHandler(fakeKeydown, nativeElement);
            });
        }
        this.searchList.labelKey = this.activeConfig.labelKey;
        this.searchList.dropUp = this.activeConfig.dropUp;
        this.searchList.styleOff = this.mentionConfig.disableStyle;
        this.searchList.activeIndex = 0;
        this.searchList.position(nativeElement, this.iframe);
        window.requestAnimationFrame(() => this.searchList.reset());
    }
}
