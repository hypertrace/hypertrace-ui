import { BOOLEAN_PROPERTY, Model, ModelProperty, ModelPropertyType, NUMBER_PROPERTY } from '@hypertrace/hyperdash';
import { InteractionHandler } from '../../../interaction/interaction-handler';

@Model({
  type: 'table-widget-row-interaction',
  displayName: 'Row Selection'
})
export class TableWidgetRowInteractionModel {
  @ModelProperty({
    key: 'handler',
    displayName: 'Selection Handler',
    type: ModelPropertyType.TYPE
  })
  public handler?: InteractionHandler;

  @ModelProperty({
    key: 'row-depth',
    displayName: 'Row Depth',
    type: NUMBER_PROPERTY.type
  })
  public rowDepth: number = 0;

  @ModelProperty({
    key: 'apply-to-child-rows',
    displayName: 'Apply to child rows',
    type: BOOLEAN_PROPERTY.type
  })
  public applyToChildRows: boolean = true;

  public appliesToCurrentRowDepth(depth: number): boolean {
    return this.applyToChildRows ? depth >= this.rowDepth : this.rowDepth === depth;
  }
}
