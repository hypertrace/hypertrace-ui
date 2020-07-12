import { Injectable } from '@angular/core';
import { ModelScopedDashboardEvent } from '@hypertrace/hyperdash';
import { DashboardEventManagerService } from '@hypertrace/hyperdash-angular';
import { Entity } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';

@Injectable({ providedIn: 'root' })
export class DashboardEntityNavigationHandlerService extends ModelScopedDashboardEvent<Entity> {
  public constructor(
    dashboardEventManager: DashboardEventManagerService,
    private readonly entityNavService: EntityNavigationService
  ) {
    super(dashboardEventManager);

    this.getObservable().subscribe(event => this.onQueryEvent(event.data));
  }

  public onQueryEvent(entity: Entity): void {
    this.entityNavService.navigateToEntity(entity);
  }
}
