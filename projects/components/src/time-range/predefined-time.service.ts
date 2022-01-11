import { Injectable } from '@angular/core';
import { Time } from '@hypertrace/common';

@Injectable({
  providedIn: 'root'
})
export class PredefinedTimeService {
  private readonly predefinedTimes: Time[] = [];

  public constructor() {
    this.predefinedTimes = this.generateTimes();
  }

  private generateTimes(): Time[] {
    const times: Time[] = [];

    for (let hour = 0; hour < 24; hour++) {
      // Could have an inner loop here, but this seems fine.
      times.push(new Time(hour, 0, 0, 0, true));
      times.push(new Time(hour, 30, 0, 0, true));
    }

    return times;
  }

  public getPredefinedTimes(): Time[] {
    return this.predefinedTimes;
  }
}
