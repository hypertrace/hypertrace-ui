import { Injectable } from '@angular/core';
import { TimeDuration, TimeUnit } from '@hypertrace/common';

@Injectable({
  providedIn: 'root'
})
export class PredefinedTimeDurationService {
  private readonly predefinedTimeDurations: TimeDuration[] = [];

  public constructor() {
    this.predefinedTimeDurations = this.createTimeDurations();
  }

  private createTimeDurations(): TimeDuration[] {
    return [
      new TimeDuration(15, TimeUnit.Minute),
      new TimeDuration(30, TimeUnit.Minute),
      new TimeDuration(1, TimeUnit.Hour),
      new TimeDuration(2, TimeUnit.Hour),
      new TimeDuration(3, TimeUnit.Hour),
      new TimeDuration(6, TimeUnit.Hour),
      new TimeDuration(12, TimeUnit.Hour),
      new TimeDuration(1, TimeUnit.Day),
      new TimeDuration(3, TimeUnit.Day),
      new TimeDuration(1, TimeUnit.Week)
    ];
  }

  public getPredefinedTimeDurations(): TimeDuration[] {
    return this.predefinedTimeDurations;
  }
}
