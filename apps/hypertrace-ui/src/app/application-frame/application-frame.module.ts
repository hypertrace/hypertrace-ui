import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ApplicationHeaderModule, IconModule, PageHeaderModule } from '@hypertrace/components';
import { NavigationModule } from '../shared/navigation/navigation.module';
import { ApplicationFrameComponent } from './application-frame.component';

@NgModule({
  imports: [ApplicationHeaderModule, NavigationModule, PageHeaderModule, HttpClientModule, RouterModule, IconModule],
  declarations: [ApplicationFrameComponent],
  exports: [ApplicationFrameComponent]
})
export class ApplicationFrameModule {}
