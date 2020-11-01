import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
    HttpClientModule,
    ApplicationFrameModule,
    ObservabilityDashboardModule,
    MatSnackBarModule
  ],
  declarations: [RootComponent],
  bootstrap: [RootComponent]
})
export class RootModule {}
