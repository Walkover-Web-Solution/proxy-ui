import { PlacementTypes } from './placement.type';

const caretOffset = 7;

function verticalPosition(elDimensions, popoverDimensions, alignment) {
    if (alignment === 'top') {
        return elDimensions.top - caretOffset;
    }

    if (alignment === 'bottom') {
        return elDimensions.top + elDimensions.height - popoverDimensions.height + caretOffset;
    }

    if (alignment === 'center') {
        return elDimensions.top + elDimensions.height / 2 - popoverDimensions.height / 2;
    }

    return undefined;
}

function horizontalPosition(elDimensions, popoverDimensions, alignment) {
    if (alignment === 'left') {
        return elDimensions.left - caretOffset;
    }

    if (alignment === 'right') {
        return elDimensions.left + elDimensions.width - popoverDimensions.width + caretOffset;
    }

    if (alignment === 'center') {
        return elDimensions.left + elDimensions.width / 2 - popoverDimensions.width / 2;
    }

    return undefined;
}

/**
 * Position helper for the popover directive.
 *
 * @export
 */
export class PositionHelper {
    /**
     * Calculate vertical alignment position
     *
     * @memberOf PositionHelper
     */
    static calculateVerticalAlignment(elDimensions, popoverDimensions, alignment): number {
        let result = verticalPosition(elDimensions, popoverDimensions, alignment);

        if (result + popoverDimensions.height > window.innerHeight) {
            result = window.innerHeight - popoverDimensions.height;
        }

        return result;
    }

    /**
     * Calculate vertical caret position
     *
     * @memberOf PositionHelper
     */
    static calculateVerticalCaret(elDimensions, popoverDimensions, caretDimensions, alignment): number {
        let result;

        if (alignment === 'top') {
            result = elDimensions.height / 2 - caretDimensions.height / 2 + caretOffset;
        }

        if (alignment === 'bottom') {
            result = popoverDimensions.height - elDimensions.height / 2 - caretDimensions.height / 2 - caretOffset;
        }

        if (alignment === 'center') {
            result = popoverDimensions.height / 2 - caretDimensions.height / 2;
        }

        const popoverPosition = verticalPosition(elDimensions, popoverDimensions, alignment);
        if (popoverPosition + popoverDimensions.height > window.innerHeight) {
            result += popoverPosition + popoverDimensions.height - window.innerHeight;
        }

        return result;
    }

    /**
     * Calculate horz alignment position
     *
     * @memberOf PositionHelper
     */
    static calculateHorizontalAlignment(elDimensions, popoverDimensions, alignment): number {
        let result = horizontalPosition(elDimensions, popoverDimensions, alignment);

        if (result + popoverDimensions.width > window.innerWidth) {
            result = window.innerWidth - popoverDimensions.width;
        }

        return result;
    }

    /**
     * Calculate horz caret position
     *
     * @memberOf PositionHelper
     */
    static calculateHorizontalCaret(elDimensions, popoverDimensions, caretDimensions, alignment): number {
        let result;

        if (alignment === 'left') {
            result = elDimensions.width / 2 - caretDimensions.width / 2 + caretOffset;
        }

        if (alignment === 'right') {
            result = popoverDimensions.width - elDimensions.width / 2 - caretDimensions.width / 2 - caretOffset;
        }

        if (alignment === 'center') {
            result = popoverDimensions.width / 2 - caretDimensions.width / 2;
        }

        const popoverPosition = horizontalPosition(elDimensions, popoverDimensions, alignment);
        if (popoverPosition + popoverDimensions.width > window.innerWidth) {
            result += popoverPosition + popoverDimensions.width - window.innerWidth;
        }

        return result;
    }

    /**
     * Checks if the element's position should be flipped
     *
     * @memberOf PositionHelper
     */
    static shouldFlip(elDimensions, popoverDimensions, placement, spacing): boolean {
        let flip = false;

        if (placement === 'right') {
            if (elDimensions.left + elDimensions.width + popoverDimensions.width + spacing > window.innerWidth) {
                flip = true;
            }
        }

        if (placement === 'left') {
            if (elDimensions.left - popoverDimensions.width - spacing < 0) {
                flip = true;
            }
        }

        if (placement === 'top') {
            if (elDimensions.top - popoverDimensions.height - spacing < 0) {
                flip = true;
            }
        }

        if (placement === 'bottom') {
            if (elDimensions.top + elDimensions.height + popoverDimensions.height + spacing > window.innerHeight) {
                flip = true;
            }
        }

        return flip;
    }

    /**
     * Position caret
     *
     * @memberOf PositionHelper
     */
    static positionCaret(placement, elmDim, hostDim, caretDimensions, alignment): any {
        let top = 0;
        let left = 0;

        if (placement === PlacementTypes.right) {
            left = -7;
            top = PositionHelper.calculateVerticalCaret(hostDim, elmDim, caretDimensions, alignment);
        } else if (placement === PlacementTypes.left) {
            left = elmDim.width;
            top = PositionHelper.calculateVerticalCaret(hostDim, elmDim, caretDimensions, alignment);
        } else if (placement === PlacementTypes.top) {
            top = elmDim.height;
            left = PositionHelper.calculateHorizontalCaret(hostDim, elmDim, caretDimensions, alignment);
        } else if (placement === PlacementTypes.bottom) {
            top = -7;
            left = PositionHelper.calculateHorizontalCaret(hostDim, elmDim, caretDimensions, alignment);
        }

        return { top, left };
    }

    /**
     * Position content
     *
     * @memberOf PositionHelper
     */
    static positionContent(placement, elmDim, hostDim, spacing, alignment): any {
        let top = 0;
        let left = 0;

        if (placement === PlacementTypes.right) {
            left = hostDim.left + hostDim.width + spacing;
            top = PositionHelper.calculateVerticalAlignment(hostDim, elmDim, alignment);
        } else if (placement === PlacementTypes.left) {
            left = hostDim.left - elmDim.width - spacing;
            top = PositionHelper.calculateVerticalAlignment(hostDim, elmDim, alignment);
        } else if (placement === PlacementTypes.top) {
            top = hostDim.top - elmDim.height - spacing;
            left = PositionHelper.calculateHorizontalAlignment(hostDim, elmDim, alignment);
        } else if (placement === PlacementTypes.bottom) {
            top = hostDim.top + hostDim.height + spacing;
            left = PositionHelper.calculateHorizontalAlignment(hostDim, elmDim, alignment);
        }

        return { top, left };
    }

    /**
     * Determine placement based on flip
     *
     * @memberOf PositionHelper
     */
    static determinePlacement(placement, elmDim, hostDim, spacing): any {
        const shouldFlip = PositionHelper.shouldFlip(hostDim, elmDim, placement, spacing);

        if (shouldFlip) {
            if (placement === PlacementTypes.right) {
                return PlacementTypes.left;
            } else if (placement === PlacementTypes.left) {
                return PlacementTypes.right;
            } else if (placement === PlacementTypes.top) {
                return PlacementTypes.bottom;
            } else if (placement === PlacementTypes.bottom) {
                return PlacementTypes.top;
            }
        }

        return placement;
    }
}
