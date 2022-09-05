import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ServiceInstrumentationComponent } from './service-instrumentation.component';

@NgModule({
  imports: [CommonModule],
  declarations: [ServiceInstrumentationComponent],
  exports: [ServiceInstrumentationComponent]
})
export class ServiceInstrumentationModule {}
