import { InteractionHandler } from '@hypertrace/distributed-tracing';
import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { Entity } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';

@Model({
  type: 'entity-navigation-handler'
})
export class EntityNavigationHandlerModel implements InteractionHandler {
  @ModelInject(EntityNavigationService)
  private readonly entityNavService!: EntityNavigationService;

  public execute(entity: Entity): Observable<void> {
    this.entityNavService.navigateToEntity(entity);

    return of();
  }
}
