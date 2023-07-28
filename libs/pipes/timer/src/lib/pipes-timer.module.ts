import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({
    name: 'timer',
})
export class TimerPipe implements PipeTransform {
    public transform(totalSeconds: string | number): string {
        totalSeconds = Number(totalSeconds ?? 0);
        let hours = 0;
        let minutes = 0;
        let seconds = 0;

        if (totalSeconds >= 3600) {
            hours = Math.floor(totalSeconds / 3600);
            totalSeconds -= 3600 * hours;
        }

        if (totalSeconds >= 60) {
            minutes = Math.floor(totalSeconds / 60);
            totalSeconds -= 60 * minutes;
        }

        seconds = totalSeconds;
        let formattedTime = '';
        if (hours) {
            formattedTime = formattedTime.concat(hours > 9 ? `${String(hours)}:` : `0${hours}:`);
        }
        if (minutes) {
            formattedTime = formattedTime.concat(minutes > 9 ? `${String(minutes)}:` : `0${minutes}:`);
        } else {
            formattedTime = formattedTime.concat('00:');
        }
        if (seconds) {
            formattedTime = formattedTime.concat(seconds > 9 ? String(seconds) : `0${seconds}`);
        } else {
            formattedTime = formattedTime.concat('00');
        }
        return formattedTime;
    }
}

@NgModule({
    imports: [CommonModule],
    declarations: [TimerPipe],
    exports: [TimerPipe],
})
export class PipesTimerModule {}
