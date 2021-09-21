import { Injectable } from '@angular/core';
import { UserTraits } from './telemetry';
import { UserTelemetryHelperService } from './user-telemetry-helper.service';

@Injectable({ providedIn: 'root' })
export class UserTelemetryService {
  public constructor(private readonly userTelemetryHelperService: UserTelemetryHelperService) {}

  public initialize(userTraits: UserTraits): void {
    this.userTelemetryHelperService.initialize();
    this.userTelemetryHelperService.identify(userTraits);
  }

  public shutdown(): void {
    this.userTelemetryHelperService.shutdown();
  }
}
