import { PopoverRef, SheetSize } from '@hypertrace/components';
import { EnumPropertyTypeInstance, ENUM_TYPE, ModelTemplatePropertyType } from '@hypertrace/dashboards';
import { BOOLEAN_PROPERTY, Model, ModelApi, ModelJson, ModelProperty, STRING_PROPERTY } from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { get, isEmpty } from 'lodash-es';
import { Observable, of } from 'rxjs';
import { InteractionHandler } from '../interaction-handler';
import { DetailSheetInteractionHandlerService } from './detail-sheet-interaction-handler.service';

@Model({
  type: 'detail-sheet-interaction-handler'
})
export class DetailSheetInteractionHandlerModel implements InteractionHandler {
  @ModelProperty({
    key: 'detail-template',
    type: ModelTemplatePropertyType.TYPE
  })
  public detailTemplate!: ModelJson;

  @ModelProperty({
    key: 'sheet-size',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [SheetSize.Small, SheetSize.Medium, SheetSize.Large, SheetSize.ExtraLarge, SheetSize.ResponsiveExtraLarge]
    } as EnumPropertyTypeInstance
  })
  public sheetSize: SheetSize = SheetSize.Large;

  @ModelProperty({
    key: 'title-property-path',
    required: false,
    type: STRING_PROPERTY.type
  })
  public titlePropertyPath?: string;

  @ModelProperty({
    key: 'inject-source-as',
    type: STRING_PROPERTY.type
  })
  public injectSourceAs: string = 'source';

  @ModelProperty({
    key: 'show-header',
    type: BOOLEAN_PROPERTY.type
  })
  public showHeader: boolean = true;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(DetailSheetInteractionHandlerService)
  private readonly handlerService!: DetailSheetInteractionHandlerService;

  private popover?: PopoverRef;

  public execute(data?: unknown): Observable<void> {
    if (isEmpty(data)) {
      this.clear();

      return of();
    }

    let source = data;

    if (Array.isArray(data)) {
      if (data.length > 1) {
        throw new Error('multiple source data found');
      }

      source = data[0];
    }

    this.showSheet(source);

    return of();
  }

  private showSheet(source: unknown): void {
    const title = get(source, this.titlePropertyPath ?? '');
    const model = this.getDetailModel(source);

    this.popover = this.handlerService.showSheet(model, this.sheetSize, title, this.showHeader);
  }

  private getDetailModel(source: unknown): object {
    const detailModel = this.api.createChild<object>(this.detailTemplate);
    this.api.setVariable(this.injectSourceAs, source, detailModel);

    return detailModel;
  }

  private clear(): void {
    this.popover?.close();
  }
}
