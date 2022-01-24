import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { IconType } from '@hypertrace/assets-library';
import { NavigationParams } from '@hypertrace/common';
import {
  ButtonStyle,
  FilterOperator,
  LoadAsyncConfig,
  LoaderType,
  OverlayService,
  SheetRef,
  SheetSize
} from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { isEmpty } from 'lodash-es';
import { Observable } from 'rxjs';
import { ExplorerService } from '../../../../pages/explorer/explorer-service';
import { ScopeQueryParam } from '../../../../pages/explorer/explorer.component';
import { SpanDetailLayoutStyle } from '../../../components/span-detail/span-detail-layout-style';
import { SpanDetailTab } from '../../../components/span-detail/span-detail-tab';
import { WaterfallWidgetModel } from './waterfall-widget.model';
import { WaterfallData } from './waterfall/waterfall-chart';
import { MarkerSelection, WaterfallChartComponent } from './waterfall/waterfall-chart.component';

@Renderer({ modelClass: WaterfallWidgetModel })
@Component({
  selector: 'ht-waterfall-widget-renderer',
  styleUrls: ['./waterfall-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="waterfall-widget-renderer fill-container">
      <div class="content" *htLoadAsync="this.data$ as data; config: this.dataLoadingConfig">
        <div class="header">
          <ht-label class="widget-title" *ngIf="this.model.title" [label]="this.model.title"></ht-label>

          <div class="expand-collapse-buttons">
            <ht-button
              display="${ButtonStyle.Text}"
              icon="${IconType.CollapseAll}"
              label="Collapse All"
              (click)="this.onCollapseAll()"
            ></ht-button>
            <ht-button
              display="${ButtonStyle.Text}"
              icon="${IconType.ExpandAll}"
              label="Expand All"
              (click)="this.onExpandAll()"
            ></ht-button>
          </div>
        </div>

        <ht-waterfall-chart
          #chart
          class="waterfall-widget"
          [data]="data"
          (selectionChange)="this.onTableRowSelection($event)"
          (markerSelection)="this.onMarkerSelection($event)"
        ></ht-waterfall-chart>
      </div>
    </div>

    <!-- Sidebar Details -->
    <ng-template #sidebarDetails>
      <div class="span-detail">
        <ht-span-detail
          [spanData]="this.selectedData"
          [showTitleHeader]="true"
          layout="${SpanDetailLayoutStyle.Vertical}"
          [activeTabLabel]="this.activeTabLabel"
          (closed)="this.closeSheet()"
        >
          <div class="filterable-summary-value">
            <ht-summary-value
              class="summary-value"
              data-sensitive-pii
              icon="${IconType.SpanId}"
              label="Span ID"
              [value]="this.selectedData!.id"
            ></ht-summary-value>
            <ht-explore-filter-link
              class="filter-link"
              [paramsOrUrl]="getExploreNavigationParams | htMemoize: this.selectedData | async"
              htTooltip="See spans in Explorer"
            >
            </ht-explore-filter-link>
          </div>
        </ht-span-detail>
      </div>
    </ng-template>
  `
})
export class WaterfallWidgetRendererComponent
  extends WidgetRenderer<WaterfallWidgetModel, WaterfallData[]>
  implements OnInit {
  public readonly dataLoadingConfig: LoadAsyncConfig = { load: { loaderType: LoaderType.TableRow } };
  @ViewChild('chart')
  private readonly waterfallChart!: WaterfallChartComponent;

  @ViewChild('sidebarDetails', { static: true })
  public sidebarDetails!: TemplateRef<unknown>;

  private sheet?: SheetRef;
  public selectedData?: WaterfallData;
  public activeTabLabel?: SpanDetailTab;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<WaterfallWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly overlayService: OverlayService,
    private readonly explorerService: ExplorerService
  ) {
    super(api, changeDetector);
  }

  public onTableRowSelection(selectedData: WaterfallData): void {
    this.activeTabLabel = undefined;
    if (selectedData === this.selectedData || isEmpty(selectedData)) {
      this.closeSheet();
    } else {
      this.openSheet(selectedData);
    }
  }

  public onMarkerSelection(selectedMarker: MarkerSelection): void {
    this.activeTabLabel = SpanDetailTab.Logs;
    this.openSheet(selectedMarker.selectedData!);
  }

  public onExpandAll(): void {
    this.waterfallChart.onExpandAll();
  }

  public onCollapseAll(): void {
    this.waterfallChart.onCollapseAll();
  }

  private openSheet(selected: WaterfallData): void {
    this.sheet?.close();
    this.selectedData = selected;

    this.sheet = this.overlayService.createSheet({
      showHeader: false,
      size: SheetSize.ResponsiveExtraLarge,
      content: this.sidebarDetails
    });
  }

  public closeSheet(): void {
    this.sheet?.close();
    this.selectedData = undefined;
    this.changeDetector.markForCheck(); // Need this for child table to remove selected-row class
  }

  protected fetchData(): Observable<WaterfallData[]> {
    return this.model.getData();
  }

  public getExploreNavigationParams = (selectedData: WaterfallData | undefined): Observable<NavigationParams> =>
    this.explorerService.buildNavParamsWithFilters(ScopeQueryParam.Spans, [
      { field: 'id', operator: FilterOperator.Equals, value: selectedData!.id }
    ]);
}
