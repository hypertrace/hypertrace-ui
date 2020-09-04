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
import { ButtonStyle, OverlayService, PopoverRef, SheetSize } from '@hypertrace/components';
import { WidgetRenderer } from '@hypertrace/dashboards';
import { Renderer } from '@hypertrace/hyperdash';
import { RendererApi, RENDERER_API } from '@hypertrace/hyperdash-angular';
import { Observable } from 'rxjs';
import { SpanDetailLayoutStyle } from '../../../components/span-detail/span-detail-layout-style';
import { WaterfallWidgetModel } from './waterfall-widget.model';
import { WaterfallData } from './waterfall/waterfall-chart';
import { WaterfallChartComponent } from './waterfall/waterfall-chart.component';

@Renderer({ modelClass: WaterfallWidgetModel })
@Component({
  selector: 'ht-waterfall-widget-renderer',
  styleUrls: ['./waterfall-widget-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="waterfall-widget-renderer fill-container">
      <div class="content" *htLoadAsync="this.data$ as data">
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
          (closed)="this.closeSheet()"
        >
          <ht-summary-value icon="${IconType.Id}" label="Span ID" [value]="this.selectedData!.id"></ht-summary-value>
        </ht-span-detail>
      </div>
    </ng-template>
  `
})
export class WaterfallWidgetRendererComponent extends WidgetRenderer<WaterfallWidgetModel, WaterfallData[]>
  implements OnInit {
  @ViewChild('chart')
  private readonly waterfallChart!: WaterfallChartComponent;

  @ViewChild('sidebarDetails', { static: true })
  public sidebarDetails!: TemplateRef<unknown>;

  private popoverRef?: PopoverRef;
  public selectedData?: WaterfallData;

  public constructor(
    @Inject(RENDERER_API) api: RendererApi<WaterfallWidgetModel>,
    changeDetector: ChangeDetectorRef,
    private readonly overlayService: OverlayService
  ) {
    super(api, changeDetector);
  }

  public onTableRowSelection(selectedData: WaterfallData): void {
    if (selectedData === this.selectedData) {
      this.closeSheet();
    } else {
      this.openSheet(selectedData);
    }
  }

  public onExpandAll(): void {
    this.waterfallChart.onExpandAll();
  }

  public onCollapseAll(): void {
    this.waterfallChart.onCollapseAll();
  }

  private openSheet(selected: WaterfallData): void {
    if (this.popoverRef !== undefined) {
      this.popoverRef.close();
    }

    this.selectedData = selected;

    this.popoverRef = this.overlayService.createSheet({
      showHeader: false,
      size: SheetSize.ResponsiveExtraLarge,
      content: this.sidebarDetails
    });
  }

  public closeSheet(): void {
    this.popoverRef?.close();
    this.selectedData = undefined;
    this.changeDetector.markForCheck(); // Need this for child table to remove selected-row class
  }

  protected fetchData(): Observable<WaterfallData[]> {
    return this.model.getData();
  }
}
