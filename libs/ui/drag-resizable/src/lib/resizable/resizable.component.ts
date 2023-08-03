import { CdkDragMove } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, ElementRef, Input, NgZone, ViewChild } from '@angular/core';

@Component({
    selector: 'proxy-resizable',
    templateUrl: './resizable.component.html',
    styleUrls: ['./resizable.component.scss'],
})
export class ResizableComponent implements AfterViewInit {
    @Input() resizeCornerRight: boolean = false;
    @Input() resizeRight: boolean = false;
    @Input() resizeBottom: boolean = false;
    @Input() resizeCornerLeft: boolean = false;
    @Input() resizeLeft: boolean = false;
    @Input() resizeTop: boolean = false;
    @Input() width: number;
    @ViewChild('resizeBox') resizeBox: ElementRef;
    @ViewChild('dragHandleRightCorner') dragHandleCornerRight: ElementRef;
    @ViewChild('dragHandleLeftCorner') dragHandleCornerLeft: ElementRef;
    @ViewChild('dragHandleRight') dragHandleRight: ElementRef;
    @ViewChild('dragHandleBottom') dragHandleBottom: ElementRef;
    @ViewChild('dragHandleLeft') dragHandleLeft: ElementRef;
    @ViewChild('dragHandleTop') dragHandleTop: ElementRef;

    get resizeBoxElement(): HTMLElement {
        return this.resizeBox.nativeElement;
    }

    get dragHandleCornerRightElement(): HTMLElement {
        return this.dragHandleCornerRight.nativeElement;
    }

    get dragHandleCornerLeftElement(): HTMLElement {
        return this.dragHandleCornerLeft.nativeElement;
    }

    get dragHandleRightElement(): HTMLElement {
        return this.dragHandleRight.nativeElement;
    }

    get dragHandleBottomElement(): HTMLElement {
        return this.dragHandleBottom.nativeElement;
    }

    get dragHandleLeftElement(): HTMLElement {
        return this.dragHandleLeft.nativeElement;
    }

    get dragHandleTopElement(): HTMLElement {
        return this.dragHandleTop.nativeElement;
    }

    constructor(private ngZone: NgZone) {}

    ngAfterViewInit() {
        this.setAllHandleTransform();
    }

    setAllHandleTransform() {
        const rect = this.resizeBoxElement.getBoundingClientRect();
        this.setHandleTransform(this.dragHandleCornerRightElement, rect, 'both');
        this.setHandleTransform(this.dragHandleCornerLeftElement, rect, 'both');
        this.setHandleTransform(this.dragHandleRightElement, rect, 'x');
        this.setHandleTransform(this.dragHandleBottomElement, rect, 'y');
        this.setHandleTransform(this.dragHandleLeftElement, rect, 'x');
        this.setHandleTransform(this.dragHandleTopElement, rect, 'y');
    }

    setHandleTransform(dragHandle: HTMLElement, targetRect: ClientRect | DOMRect, position: 'x' | 'y' | 'both') {
        const dragRect = dragHandle.getBoundingClientRect();
        const translateX = targetRect.width - dragRect.width;
        const translateY = targetRect.height - dragRect.height;

        if (position === 'x') {
            if (this.resizeLeft) {
                dragHandle.style.transform = `translate(0px, 0)`;
            } else if (this.resizeRight) {
                dragHandle.style.transform = `translate(${translateX}px, 0)`;
            }
        }

        if (position === 'y') {
            if (this.resizeBottom) {
                dragHandle.style.transform = `translate(0, 0px)`;
            } else if (this.resizeTop) {
                dragHandle.style.transform = `translate(0, ${translateY}px)`;
            }
        }

        if (position === 'both') {
            if (this.resizeCornerLeft) {
                dragHandle.style.transform = `translate(0px, ${translateY}px)`;
            } else if (this.resizeCornerRight) {
                dragHandle.style.transform = `translate(${translateX}px, ${translateY}px)`;
            }
        }
    }

    public dragMove(
        dragHandle: HTMLElement,
        $event: CdkDragMove<any>,
        dragFromSide: 'rightCorner' | 'leftCorner' | 'right' | 'left' | 'top' | 'bottom'
    ): void {
        this.ngZone.runOutsideAngular(() => {
            this.resize(dragHandle, this.resizeBoxElement, dragFromSide, $event);
        });
    }

    public resize(
        dragHandle: HTMLElement,
        target: HTMLElement,
        dragFromSide: 'rightCorner' | 'leftCorner' | 'right' | 'left' | 'top' | 'bottom',
        $event: CdkDragMove<any>
    ): void {
        const dragRect = dragHandle.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        let width, height;
        // const width = dragRect.left - targetRect.left + dragRect.width;
        // const height = dragRect.top - targetRect.top + dragRect.height;

        if (dragFromSide === 'left') {
            width = dragRect.width - dragRect.left + targetRect.left;
        } else if (dragFromSide === 'right') {
            width = dragRect.left - targetRect.left + dragRect.width;
        } else if (dragFromSide === 'bottom') {
            height = dragRect.top - targetRect.top + dragRect.height;
        } else if (dragFromSide === 'top') {
            height = dragRect.height - dragRect.top + targetRect.top;
        } else if (dragFromSide === 'rightCorner') {
            width = dragRect.left - targetRect.left + dragRect.width;
            height = dragRect.top - targetRect.top + dragRect.height;
        } else if (dragFromSide === 'leftCorner') {
            width = dragRect.width - dragRect.left + targetRect.left;
            height = dragRect.top - targetRect.top + dragRect.height;
        }

        if (width < 0) {
            $event.source._dragRef.reset();
        }

        const maxWidth = (window.innerWidth * 80) / 100;

        target.style.width = width + this.width + 'px';
        target.style.minWidth = this.width + 'px';
        target.style.maxWidth = maxWidth + 'px';
        target.style.height = height + 'px';

        this.setAllHandleTransform();
    }
}
