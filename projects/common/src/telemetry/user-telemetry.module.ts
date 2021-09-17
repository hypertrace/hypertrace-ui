import { Inject, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';
import { UserTelemetryRegistrationConfig } from './telemetry';
import { UserTelemetryHelperService } from './user-telemetry-helper.service';

@NgModule()
export class UserTelemetryModule {
  public constructor(
    @Inject(USER_TELEMETRY_PROVIDER_TOKENS) providerConfigs: UserTelemetryRegistrationConfig<unknown>[][],
    userTelemetryHelperService: UserTelemetryHelperService
  ) {
    userTelemetryHelperService.register(...providerConfigs.flat());
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

const USER_TELEMETRY_PROVIDER_TOKENS = new InjectionToken<UserTelemetryRegistrationConfig<unknown>[][]>(
  'USER_TELEMETRY_PROVIDER_TOKENS'
);
