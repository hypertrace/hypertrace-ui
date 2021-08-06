import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ObservabilityDashboardModule } from '@hypertrace/observability';
import { ApplicationFrameModule } from './application-frame/application-frame.module';
import { ConfigModule } from './config.module';
import { RootComponent } from './root.component';
import { RootRoutingModule } from './routes/root-routing.module';
import { NavigationModule } from './shared/navigation/navigation.module';

import {ConfigService} from  './shared/services/config.service'

export const configFactory = (configService: ConfigService) => {
  return () => configService.loadConfig();
};

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RootRoutingModule,
    ConfigModule,
    NavigationModule,
    HttpClientModule,
    ApplicationFrameModule,
    ObservabilityDashboardModule
  ],
  declarations: [RootComponent],
  bootstrap: [RootComponent],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: configFactory,
    deps: [ConfigService],
    multi: true
  }]
})
export class RootModule {}
