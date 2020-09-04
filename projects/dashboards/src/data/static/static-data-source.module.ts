import { NgModule } from '@angular/core';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { StaticDataSource } from './static-data-source.model';

@NgModule({
  imports: [
    DashboardCoreModule.with({
      models: [StaticDataSource]
    })
  ]
})
export class StaticDataSourceModule {}
