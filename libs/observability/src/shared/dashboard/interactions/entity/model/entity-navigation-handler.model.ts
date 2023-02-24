import { Model } from '@hypertrace/hyperdash';
import { ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { Entity } from '../../../../graphql/model/schema/entity';
import { EntityNavigationService } from '../../../../services/navigation/entity/entity-navigation.service';
import { InteractionHandler } from '../../../interaction/interaction-handler';

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
