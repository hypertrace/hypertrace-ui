import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { ModelPropertyTypeRegistrationInformation } from '@hypertrace/hyperdash';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { StaticDataSourceModule } from '../../data/static/static-data-source.module';
import { ModelTemplatePropertyType } from './property-types/model-template-type';
import { RepeatRendererComponent } from './repeat-renderer.component';
import { RepeatModel } from './repeat.model';

@NgModule({
  declarations: [RepeatRendererComponent],
  imports: [
    CommonModule,
    StaticDataSourceModule,
    DashboardCoreModule.with({
      models: [RepeatModel],
      propertyTypes: [ModelTemplatePropertyType as Type<ModelPropertyTypeRegistrationInformation>],
      renderers: [RepeatRendererComponent]
    })
  ]
})
export class RepeatModule {}
