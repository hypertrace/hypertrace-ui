import {
  ARRAY_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AutoContainerLayoutModel } from './layout/auto/auto-container-layout.model';
import { ContainerLayout } from './layout/container-layout';

@Model({
  type: 'conditional-container-widget'
})
export class ConditionalContainerWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type,
    required: false
  })
  public title?: string;

  @ModelProperty({
    key: 'layout',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: AutoContainerLayoutModel
    } as ModelModelPropertyTypeInstance
  })
  public layout!: ContainerLayout;

  @ModelProperty({
    key: 'trueChildren',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public trueChildren: object[] = [];

  @ModelProperty({
    key: 'falseChildren',
    type: ARRAY_PROPERTY.type,
    required: true
  })
  public falseChildren: object[] = [];

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<boolean> {
    return this.api.getData<boolean>();
  }

  public getChildren(): Observable<object[]> {
    return this.getData().pipe(map(result => (result ? this.trueChildren : this.falseChildren)));
  }
}
