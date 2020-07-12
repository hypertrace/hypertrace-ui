import { InteractionHandler } from '@hypertrace/distributed-tracing';
import { Model, ModelEventPublisher } from '@hypertrace/hyperdash';
import { Observable, of, Subject } from 'rxjs';
import { Entity } from '../../../../graphql/model/schema/entity';
import { DashboardEntityNavigationHandlerService } from '../handler-service/dashboard-entity-navigation-handler.service';

@Model({
  type: 'entity-navigation-handler'
})
export class EntityNavigationHandlerModel implements InteractionHandler {
  @ModelEventPublisher(DashboardEntityNavigationHandlerService)
  protected readonly navigate$: Subject<Entity> = new Subject();

  public execute(entity: Entity): Observable<void> {
    this.navigate$.next(entity);

    return of();
  }
}
