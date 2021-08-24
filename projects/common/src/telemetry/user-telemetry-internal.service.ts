import { Injectable } from '@angular/core';
import { Dictionary } from '../utilities/types/types';

@Injectable({ providedIn: 'root' })
export class UserTelemetryInternalService {
  public register(): void {}

  public initialize(): void {}

  public shutdown(): void {}

  public trackEvent(_name: string, _data: Dictionary<unknown>): void {}
}
