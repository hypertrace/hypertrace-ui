import { Inject, ModuleWithProviders, NgModule } from '@angular/core';
import { UserTelemetryRegistrationConfig, USER_TELEMETRY_PROVIDER_TOKENS } from './telemetry';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

@NgModule()
export class UserTelemetryModule {
  public constructor(
    @Inject(USER_TELEMETRY_PROVIDER_TOKENS) providerConfigs: UserTelemetryRegistrationConfig<unknown>[][],
    userTelemetryInternalService: UserTelemetryInternalService
  ) {
    userTelemetryInternalService.register(...providerConfigs.flat());
  }

  public static forRoot(
    providerConfigs: UserTelemetryRegistrationConfig<unknown>[]
  ): ModuleWithProviders<UserTelemetryModule> {
    return {
      ngModule: UserTelemetryModule,
      providers: [
        {
          provide: USER_TELEMETRY_PROVIDER_TOKENS,
          useValue: providerConfigs
        }
      ]
    };
  }
}
