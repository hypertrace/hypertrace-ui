import { Inject, ModuleWithProviders, NgModule, InjectionToken } from '@angular/core';
import { UserTelemetryRegistrationConfig } from './telemetry';
import { UserTelemetryImplService } from './user-telemetry-impl.service';
import { UserTelemetryService } from './user-telemetry.service';

@NgModule()
export class UserTelemetryModule {
  public constructor(
    @Inject(USER_TELEMETRY_PROVIDER_TOKENS) providerConfigs: UserTelemetryRegistrationConfig<unknown>[][],
    userTelemetryImplService: UserTelemetryImplService
  ) {
    userTelemetryImplService.register(...providerConfigs.flat());
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
        },
        {
          provide: UserTelemetryService,
          useExisting: UserTelemetryImplService
        }
      ]
    };
  }
}

const USER_TELEMETRY_PROVIDER_TOKENS = new InjectionToken<UserTelemetryRegistrationConfig<unknown>[][]>(
  'USER_TELEMETRY_PROVIDER_TOKENS'
);
