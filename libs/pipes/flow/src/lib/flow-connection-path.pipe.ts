import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'flowConnectionPath',
})
export class FlowConnectionPath implements PipeTransform {
    transform(
        x: number,
        path: 'first' | 'second',
        connection: any,
        sourceCoordX: number,
        sourceCoordY: number,
        destCoordX: number,
        destCoordY: number
    ): string {
        const destParentNodeWidth = connection.destParentNode().width();
        if (path === 'first') {
            const pen = `M ${sourceCoordX}, ${sourceCoordY + 30}\n`;
            const lineFactor = Math.max(-Math.abs((destCoordX + destParentNodeWidth / 2 - sourceCoordX) / 10) + 10, 0);
            const line1Y = destCoordY - (destCoordY > sourceCoordY ? 40 - lineFactor : 20 - lineFactor);
            const line1 = `L ${sourceCoordX}, ${line1Y - lineFactor * (destCoordY > sourceCoordY ? 0.5 : 3)}\n`;
            const sweep = this.XOR(
                destCoordX + destParentNodeWidth / 2 && destCoordX + destParentNodeWidth / 2 > sourceCoordX,
                destCoordY > sourceCoordY
            )
                ? 1
                : 0;
            const eX =
                destCoordX + destParentNodeWidth / 2 && destCoordX + destParentNodeWidth / 2 > sourceCoordX
                    ? 10 - lineFactor
                    : -(10 - lineFactor);
            const eY = destCoordY > sourceCoordY ? 10 - lineFactor : -(10 - lineFactor);
            const arc = `a ${10 - lineFactor} ${10 - lineFactor}, 0, 0, ${sweep}, ${eX} ${eY} \n`;
            const line2 = `L ${
                destCoordX + destParentNodeWidth / 2 - (destCoordX + destParentNodeWidth / 2 - sourceCoordX) / 2
            }, ${destCoordY - 30}\n`;
            return `${pen} ${line1} ${arc} ${line2}`;
        } else if (path === 'second') {
            const lineFactor = Math.max(-Math.abs((destCoordX - sourceCoordX) / 10) + 10, 0);
            const pen = `M ${
                destCoordX + destParentNodeWidth / 2 - (destCoordX + destParentNodeWidth / 2 - sourceCoordX) / 2
            }, ${destCoordY - 30}\n`;
            const line1 = `L ${
                destCoordX +
                destParentNodeWidth / 2 +
                (destCoordX + destParentNodeWidth / 2 > sourceCoordX ? -(10 - lineFactor) : +(10 - lineFactor))
            }, ${destCoordY - 30} \n`;
            const eXSweep =
                destCoordX + destParentNodeWidth / 2 > sourceCoordX &&
                destCoordX + destParentNodeWidth / 2 > sourceCoordX
                    ? `1, ${10 - lineFactor}`
                    : `0, -${10 - lineFactor}`;
            const arc = `a ${10 - lineFactor} ${10 - lineFactor}, 0, 0, ${eXSweep} ${10 - lineFactor} \n`;
            const line2 = `L ${destCoordX + destParentNodeWidth / 2}, ${destCoordY} \n`;
            return `${pen} ${line1} ${arc} ${line2}`;
        } else if (path === 'arrow') {
            let xCoord =
                destCoordX + destParentNodeWidth / 2 - (destCoordX + destParentNodeWidth / 2 - sourceCoordX) / 2;
            if (Math.abs(destCoordX + destParentNodeWidth / 2 - sourceCoordX) < 20) {
                const pen = `M ${xCoord - 10}, ${destCoordY - 36}\n`;
                const line1 = `L ${xCoord + 6}, ${destCoordY - 36} \n`;
                const line2 = `L ${xCoord - 2}, ${destCoordY - 20} \n`;
                return `${pen} ${line1} ${line2} Z`;
            }
            if (destCoordX + destParentNodeWidth / 2 > sourceCoordX) {
                const pen = `M ${xCoord - 10}, ${destCoordY - 36}\n`;
                const line1 = `L ${xCoord + 7}, ${destCoordY - 30} \n`;
                const line2 = `L ${xCoord - 10}, ${destCoordY - 24} \n`;
                return `${pen} ${line1} ${line2} Z`;
            } else {
                const pen = `M ${xCoord + 10}, ${destCoordY - 36}\n`;
                const line1 = `L ${xCoord - 7}, ${destCoordY - 30} \n`;
                const line2 = `L ${xCoord + 10}, ${destCoordY - 24} \n`;
                return `${pen} ${line1} ${line2} Z`;
            }
        }
        return '';
    }

    XOR(a, b) {
        return (a || b) && !(a && b);
    }
}
