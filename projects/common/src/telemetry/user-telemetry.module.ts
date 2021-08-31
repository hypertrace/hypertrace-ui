import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import { UserTelemetryConfig, USER_TELEMETRY_PROVIDER_TOKENS } from './telemetry';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

@NgModule({
  providers: [
    {
      provide: USER_TELEMETRY_PROVIDER_TOKENS,
      useValue: [],
      multi: true
    }
  ]
})
// tslint:disable-next-line: no-unnecessary-class
export class UserTelemetryModule {
  public constructor(
    userTelemetryInternalService: UserTelemetryInternalService,
    @Inject(USER_TELEMETRY_PROVIDER_TOKENS) telemetryProviderTokens: UserTelemetryConfig[][]
  ) {
    telemetryProviderTokens
      .flat()
      .forEach(telemetryProvider => userTelemetryInternalService.register(telemetryProvider));
  }

  public static withProviders(
    telemetryProviderTokens: UserTelemetryConfig[]
  ): ModuleWithProviders<UserTelemetryModule> {
    return {
      ngModule: UserTelemetryModule,
      providers: [
        {
          provide: USER_TELEMETRY_PROVIDER_TOKENS,
          useValue: telemetryProviderTokens,
          multi: true
        }
      ]
    };
  }
}
