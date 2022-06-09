import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HtRoute } from '@hypertrace/common';
import { SavedQueriesComponent, SavedQueriesModule } from '@hypertrace/observability';

const ROUTE_CONFIG: HtRoute[] = [
  {
    path: '',
    component: SavedQueriesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(ROUTE_CONFIG), SavedQueriesModule]
})
export class SavedQueriesRoutingModule {}
