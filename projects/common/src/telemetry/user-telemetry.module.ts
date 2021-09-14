import { Inject, ModuleWithProviders, NgModule, ErrorHandler } from '@angular/core';
import { GlobalErrorHandler } from './global-error-handler';
import { UserTelemetryRegistrationConfig, USER_TELEMETRY_PROVIDER_TOKENS } from './telemetry';
import { TrackDirective } from './track/track.directive';
import { UserTelemetryInternalService } from './user-telemetry-internal.service';

@NgModule({
  declarations: [TrackDirective],
  exports: [TrackDirective],
  providers: [
    {
      provide: USER_TELEMETRY_PROVIDER_TOKENS,
      useValue: [],
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ]
})
// tslint:disable-next-line: no-unnecessary-class
export class UserTelemetryModule {
  public constructor(
    userTelemetryInternalService: UserTelemetryInternalService,
    @Inject(USER_TELEMETRY_PROVIDER_TOKENS) providerConfigs: UserTelemetryRegistrationConfig<unknown>[][]
  ) {
    userTelemetryInternalService.register(...providerConfigs.flat());
  }

  public static withProviders(
    providerConfigs: UserTelemetryRegistrationConfig<unknown>[]
  ): ModuleWithProviders<UserTelemetryModule> {
    return {
      ngModule: UserTelemetryModule,
      providers: [
        {
          provide: USER_TELEMETRY_PROVIDER_TOKENS,
          useValue: providerConfigs,
          multi: true
        }
      ]
    };
  }
}
