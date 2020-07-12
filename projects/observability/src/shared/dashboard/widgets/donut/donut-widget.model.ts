import { ENUM_TYPE, EnumPropertyTypeInstance, WidgetHeaderModel } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY
} from '@hypertrace/hyperdash';
import { MODEL_API, ModelInject } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DonutResults, DonutSeriesResults } from '../../../components/donut/donut';
import { LegendPosition } from '../../../components/legend/legend.component';

@Model({
  type: 'donut-widget'
})
export class DonutWidgetModel {
  @ModelProperty({
    key: 'title',
    type: STRING_PROPERTY.type
  })
  public title?: string;

  @ModelProperty({
    key: 'center-title',
    type: STRING_PROPERTY.type
  })
  public centerTitle?: string;

  @ModelProperty({
    key: 'legend-position',
    displayName: 'Legend Position',
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ENUM_TYPE.type,
      values: [
        // LegendPosition.TopLeft and LegendPosition.TopRight intentionally not allowed
        LegendPosition.Top,
        LegendPosition.Bottom,
        LegendPosition.Right,
        LegendPosition.None
      ]
    } as EnumPropertyTypeInstance
  })
  public legendPosition: LegendPosition = LegendPosition.Right;

  @ModelProperty({
    key: 'display-legend-counts',
    type: BOOLEAN_PROPERTY.type,
    required: false
  })
  public displayLegendCounts?: boolean = true;

  @ModelProperty({
    key: 'header',
    required: false,
    // tslint:disable-next-line: no-object-literal-type-assertion
    type: {
      key: ModelPropertyType.TYPE,
      defaultModelClass: WidgetHeaderModel
    } as ModelModelPropertyTypeInstance
  })
  public header?: WidgetHeaderModel;

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  public getData(): Observable<DonutResults> {
    return this.api.getData<DonutSeriesResults>().pipe(
      map(r => ({
        series: r.series,
        center:
          this.centerTitle !== undefined
            ? {
                title: this.centerTitle,
                value: r.total
              }
            : undefined
      }))
    );
  }
}
