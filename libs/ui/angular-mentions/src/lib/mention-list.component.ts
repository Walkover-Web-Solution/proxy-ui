import {
    Component,
    ElementRef,
    Output,
    EventEmitter,
    ViewChild,
    Input,
    TemplateRef,
    AfterContentChecked,
} from '@angular/core';

import { isInputOrTextAreaElement, getContentEditableCaretCoords } from './mention-utils';
import { getCaretCoordinates } from './caret-coords';

/**
 * Angular Mentions.
 * https://github.com/dmacfarlane/angular-mentions
 *
 * Copyright (c) 2016 Dan MacFarlane
 */
@Component({
    selector: 'mention-list',
    styles: [
        `
            mention-list {
                z-index: 10000;
            }

            .mention-menu {
                position: absolute;
                top: 100%;
                left: 0;
                z-index: 1000;
                display: none;
                float: left;
                min-width: 11em;
                padding: 0.5em 0;
                margin: 0.125em 0 0;
                font-size: 14px;
                color: #212529;
                text-align: left;
                list-style: none;
                background-color: #fff;
                /* background-clip: padding-box; */
                border: 1px solid rgba(0, 0, 0, 0.15);
                border-radius: 0.25em;
            }
            .mention-item {
                display: block;
                padding: 0.2em 0.75em;
                line-height: 1.5em;
                clear: both;
                font-weight: 400;
                color: #212529;
                text-align: inherit;
                white-space: nowrap;
                background-color: transparent;
                border: 0;
            }
            .mention-active > a {
                color: #fff;
                text-decoration: none;
                background-color: #337ab7;
                outline: 0;
            }
            .scrollable-menu {
                display: block;
                height: auto;
                max-height: 230px;
                max-width: 230px;
                overflow: auto;
            }
            [hidden] {
                display: none;
            }

            .mention-dropdown {
                bottom: 100%;
                top: auto;
                margin-bottom: 2px;
            }
        `,
    ],
    template: `
        <ng-template #defaultItemTemplate let-item="item">
            {{ item[labelKey] }}
        </ng-template>
        <ul
            #list
            [hidden]="hidden"
            class="dropdown-menu scrollable-menu"
            [class.mention-menu]="!styleOff"
            [class.mention-dropdown]="!styleOff && dropUp"
        >
            <span class="ml-4" *ngIf="items?.length === 0"> No Match Found </span>
            <li
                *ngFor="let item of items; let i = index"
                [class.active]="activeIndex == i"
                [class.mention-active]="!styleOff && activeIndex == i"
            >
                <a
                    class="dropdown-item overflow-dotted"
                    [class.mention-item]="!styleOff"
                    (mousedown)="activeIndex = i; itemClick.emit(); $event.preventDefault()"
                >
                    <ng-template
                        [ngTemplateOutlet]="itemTemplate"
                        [ngTemplateOutletContext]="{ 'item': item }"
                    ></ng-template>
                </a>
            </li>
        </ul>
    `,
    host: {
        class: 'mention-list',
        '[style.position]': '"fixed"',
        '[style.zIndex]': '10000',
    },
})
export class MentionListComponent implements AfterContentChecked {
    @Input() labelKey: string = 'label';
    @Input() itemTemplate: TemplateRef<any>;
    @Output() itemClick = new EventEmitter();
    // @ViewChild('list', { static: true }) list: ElementRef;
    @ViewChild('list', { static: true }) list: ElementRef<HTMLElement>;

    @ViewChild('defaultItemTemplate', { static: true }) defaultItemTemplate: TemplateRef<any>;
    items = [];
    activeIndex: number = 0;
    hidden: boolean = false;
    dropUp: boolean = false;
    styleOff: boolean = false;
    private coords: { top: number; left: number } = { top: 0, left: 0 };
    private offset: number = 0;
    constructor(private element: ElementRef) {}

    ngAfterContentChecked() {
        if (!this.itemTemplate) {
            this.itemTemplate = this.defaultItemTemplate;
        }
    }

    // lots of confusion here between relative coordinates and containers
    position(nativeParentElement: HTMLInputElement, iframe: HTMLIFrameElement = null) {
        if (isInputOrTextAreaElement(nativeParentElement)) {
            const bound = nativeParentElement.getBoundingClientRect();

            // parent elements need to have postition:relative for this to work correctly?
            this.coords = getCaretCoordinates(nativeParentElement, nativeParentElement.selectionStart, null);
            this.coords.top = this.coords.top + bound.top - nativeParentElement.scrollTop;
            this.coords.left = this.coords.left + bound.left - nativeParentElement.scrollLeft;

            // getCretCoordinates() for text/input elements needs an additional offset to position the list correctly
            this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
        } else if (iframe) {
            const context: { iframe: HTMLIFrameElement; parent: Element } = {
                iframe: iframe,
                parent: iframe.offsetParent,
            };
            this.coords = getContentEditableCaretCoords(context);
        } else {
            // bounding rectangles are relative to view, offsets are relative to container?
            const caretRelativeToView = getContentEditableCaretCoords({ iframe: iframe });
            this.coords.top = caretRelativeToView.top;
            this.coords.left = caretRelativeToView.left;
            this.offset = this.getBlockCursorDimensions(nativeParentElement).height;
        }
        // set the default/inital position
        this.positionElement();
    }

    get activeItem() {
        return this.items[this.activeIndex];
    }

    activateNextItem() {
        // adjust scrollable-menu offset if the next item is out of view
        const listEl: HTMLElement = this.list.nativeElement;
        const activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            const nextLiEl: HTMLElement = <HTMLElement>activeEl.nextSibling;
            if (nextLiEl && nextLiEl.nodeName === 'LI') {
                const nextLiRect: ClientRect = nextLiEl.getBoundingClientRect();
                if (nextLiRect.bottom > listEl.getBoundingClientRect().bottom) {
                    listEl.scrollTop = nextLiEl.offsetTop + nextLiRect.height - listEl.clientHeight;
                }
            }
        }
        // select the next item
        this.activeIndex = Math.max(Math.min(this.activeIndex + 1, this.items.length - 1), 0);
    }

    activatePreviousItem() {
        // adjust the scrollable-menu offset if the previous item is out of view
        const listEl: HTMLElement = this.list.nativeElement;
        const activeEl = listEl.getElementsByClassName('active').item(0);
        if (activeEl) {
            const prevLiEl: HTMLElement = <HTMLElement>activeEl.previousSibling;
            if (prevLiEl && prevLiEl.nodeName === 'LI') {
                const prevLiRect: ClientRect = prevLiEl.getBoundingClientRect();
                if (prevLiRect.top < listEl.getBoundingClientRect().top) {
                    listEl.scrollTop = prevLiEl.offsetTop;
                }
            }
        }
        // select the previous item
        this.activeIndex = Math.max(Math.min(this.activeIndex - 1, this.items.length - 1), 0);
    }

    // reset for a new mention search
    reset() {
        this.list.nativeElement.scrollTop = 0;
        this.checkBounds();
    }

    // final positioning is done after the list is shown (and the height and width are known)
    // ensure it's in the page bounds
    checkBounds() {
        let left = this.coords.left,
            dropUp = this.dropUp,
            top = this.coords.top;
        this.list.nativeElement.style.maxHeight = null;
        const bounds: ClientRect = this.list.nativeElement.getBoundingClientRect();
        // if off right of page, align right
        if (bounds.left + bounds.width > window.innerWidth) {
            left -= bounds.left + bounds.width - window.innerWidth + 10;
        }
        // is overlapped by page, try to show as dropUp
        if (top + this.offset + bounds.height > window.innerHeight) {
            if (top - bounds.height >= 0) {
                dropUp = true;
                top = top - bounds.height;
            } else {
                this.list.nativeElement.style.maxHeight = `${window.innerHeight - bounds.top}px`;
            }
        }
        // if more than half off the bottom of the page, force dropUp
        // if ((bounds.top+bounds.height/2)>window.innerHeight) {
        //   dropUp = true;
        // }
        // if top is off page, disable dropUp
        // if (bounds.top < 0) {
        //     dropUp = false;
        // }
        // set the revised/final position
        this.positionElement(left, top, dropUp);
    }

    private positionElement(
        left: number = this.coords.left,
        top: number = this.coords.top,
        dropUp: boolean = this.dropUp
    ) {
        const el: HTMLElement = this.element.nativeElement;
        top += dropUp ? 0 : this.offset; // top of list is next line
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    private getBlockCursorDimensions(nativeParentElement: HTMLInputElement) {
        const parentStyles = window.getComputedStyle(nativeParentElement);
        return {
            height: parseFloat(parentStyles.lineHeight),
            width: parseFloat(parentStyles.fontSize),
        };
    }
}
