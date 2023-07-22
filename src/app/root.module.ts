import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserTelemetryModule } from '@hypertrace/common';
import { NotificationModule } from '@hypertrace/components';
import { ObservabilityDashboardModule } from '@hypertrace/observability';
import { ApplicationFrameModule } from './application-frame/application-frame.module';
import { ConfigModule } from './config.module';
import { RootComponent } from './root.component';
import { RootRoutingModule } from './routes/root-routing.module';
import { NavigationModule } from './shared/navigation/navigation.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RootRoutingModule,
    ConfigModule,
    NavigationModule,
    NotificationModule,
    HttpClientModule,
    ApplicationFrameModule,
    ObservabilityDashboardModule,
    UserTelemetryModule.forRoot([])
  ],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
