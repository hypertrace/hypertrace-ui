import {
  Model,
  ModelApi,
  ModelJson,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { StaticDataSource } from '../../data/static/static-data-source.model';
import { AutoContainerLayoutModel } from '../container/layout/auto/auto-container-layout.model';
import { ContainerLayout } from '../container/layout/container-layout';
import { ModelTemplatePropertyType } from '../../properties/property-types/model-template-type';

@Model({
  type: 'repeat'
})
export class RepeatModel {
  private children?: object[];

  @ModelProperty({
    key: 'template',
    type: ModelTemplatePropertyType.TYPE
  })
  public template!: ModelJson;

  @ModelProperty({
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: AutoContainerLayoutModel
    } as ModelModelPropertyTypeInstance,
    key: 'layout'
  })
  public layout!: ContainerLayout;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getChildren(): Observable<object[]> {
    if (this.children) {
      return of(this.children);
    }

    return this.buildChildren();
  }

  private buildChildren(): Observable<object[]> {
    if (this.children) {
      this.children.forEach(child => this.api.destroyChild(child));
    }

    return this.api.getData<unknown>().pipe(
      map(data => {
        if (Array.isArray(data)) {
          return data.map(dataValue => this.createChildForValue(dataValue));
        }

        return [];
      }),
      tap(children => (this.children = children))
    );
  }

  private createChildForValue(data: unknown): object {
    const child = this.api.createChild<object>(this.template);
    const childDataSource = this.api.createChild<StaticDataSource<unknown>>(StaticDataSource, child);
    childDataSource.value = data;
    this.api.setDataSource(childDataSource, child);

    return child;
  }
}
