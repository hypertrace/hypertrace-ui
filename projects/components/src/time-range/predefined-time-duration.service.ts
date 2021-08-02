import { Injectable } from '@angular/core';
import { TimeDuration } from '@hypertrace/common';

import {environment} from '../../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PredefinedTimeDurationService {
  private readonly predefinedTimeDurations: TimeDuration[] = [];

  public constructor() {
    this.predefinedTimeDurations = this.createTimeDurations();
  }

  private createTimeDurations(): TimeDuration[] {
    return environment.timeDurations;
  }

  public getPredefinedTimeDurations(): TimeDuration[] {
    return this.predefinedTimeDurations;
  }
}
