import { ColorService } from '@hypertrace/common';
import { EnumPropertyTypeInstance, ENUM_TYPE, WidgetHeaderModel } from '@hypertrace/dashboards';
import {
  BOOLEAN_PROPERTY,
  Model,
  ModelApi,
  ModelModelPropertyTypeInstance,
  ModelProperty,
  ModelPropertyType,
  STRING_PROPERTY,
  UNKNOWN_PROPERTY
} from '@hypertrace/hyperdash';
import { ModelInject, MODEL_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DonutResults, DonutSeries, DonutSeriesResults } from '../../../components/donut/donut';
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

  // TODO: Define a new ModelProperty as COLOR_PROPERTY for colorPalette
  @ModelProperty({
    key: 'color-palette',
    type: UNKNOWN_PROPERTY.type,
    required: false
  })
  public colorPalette?: string | string[];

  @ModelInject(MODEL_API)
  private readonly api!: ModelApi;

  @ModelInject(ColorService)
  private readonly colorService!: ColorService;

  public getData(): Observable<DonutResults> {
    return this.api.getData<DonutSeriesResults>().pipe(
      map(r => ({
        series: this.buildSeriesWithColors(r.series),
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

  private buildSeriesWithColors(series: DonutSeries[]): DonutSeries[] {
    const colors = this.colorService.getColorPalette(this.colorPalette).forNColors(series.length);

    return series.map((aSeries, index) => ({
      color: colors[index],
      ...aSeries
    }));
  }
}
