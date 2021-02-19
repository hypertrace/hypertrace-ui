import { Pipe, PipeTransform } from '@angular/core';
import { Dictionary } from '../../types/types';

@Pipe({
  name: 'htDisplayTimeAgo'
})
export class DisplayTimeAgo implements PipeTransform {
  private readonly intervals: Dictionary<number> = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  public transform(value?: DateTimeValue | null): string {
    if (value === null || value === undefined) {
      return '-';
    }

    const secondsAgo = this.calcSecondsAgo(value);

    return this.toTimeAgoString(secondsAgo);
  }

  private toTimeAgoString(secondsAgo: number): string {
    if (secondsAgo < 59) {
      return 'Just now';
    }

    for (const key of Object.keys(this.intervals)) {
      const counter = Math.floor(secondsAgo / this.intervals[key]);
      if (counter > 0) {
        return `${counter} ${key}${counter === 1 ? '' : 's'} ago`;
      }
    }

    return '-';
  }

  private calcSecondsAgo(timestamp: DateTimeValue): number {
    return Math.floor((+new Date() - +new Date(timestamp)) / 1000);
  }
}

type DateTimeValue = Date | number;
