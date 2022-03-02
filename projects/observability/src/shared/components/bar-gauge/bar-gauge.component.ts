import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  Color,
  ColorPaletteKey,
  ColorService,
  DomElementMeasurerService,
  getPercentage,
  TypedSimpleChanges
} from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { BarGaugeLegendDirective } from './bar-gauge-legend.directive';

@Component({
  selector: 'ht-bar-gauge',
  styleUrls: ['./bar-gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-gauge" (htLayoutChange)="this.checkNearMaxValue()">
      <div
        *ngIf="!['${BarGaugeStyle.SingleBar}', '${BarGaugeStyle.Distribution}'].includes(this.display)"
        class="header-data"
        [ngClass]="this.display"
      >
        <div *ngIf="this.title" class="title">{{ this.title | htDisplayTitle }}</div>
        <div class="count">
          <span>{{ this.totalValue | htDisplayNumber }}</span>
          <span> / </span>
          <span *ngIf="!this.isUnlimited">{{ this.maxValue | htDisplayNumber }}</span>
          <span class="unlimited-symbol" *ngIf="this.isUnlimited">&#8734;</span>
          <span class="units" *ngIf="this.units && !this.isUnlimited"> {{ this.units }}</span>
        </div>
      </div>
      <div class="bar" [ngClass]="this.display">
        <div
          #maxValueBar
          class="max-value-bar"
          [ngClass]="{ 'over-max-value': this.overMaxValue && this.isOverMaxBorderActive }"
        >
          <div class="segment-bars">
            <div
              #segmentBars
              *ngFor="let segment of this.barSegments"
              class="segment-bar"
              [ngClass]="{ 'hide-last-divider': this.nearMaxValue, clickable: segment.hasClickHandler }"
              [style.background]="segment.color"
              [style.width.%]="segment.percentage"
              (click)="segment?.clickHandler(segment)"
              [htTooltip]="segment.tooltip"
              [htTooltipContext]="{ $implicit: segment }"
            >
              <div class="divider"></div>
            </div>
          </div>
        </div>
      </div>
      <ng-container *ngIf="['${BarGaugeStyle.SingleBar}', '${BarGaugeStyle.Distribution}'].includes(this.display)">
        <ng-container *ngIf="customLegend; else defaultLegend">
          <ng-container *ngTemplateOutlet="customLegend.tpl; context: { $implicit: this.barSegments }"></ng-container>
        </ng-container>
      </ng-container>

      <ng-template #defaultLegend>
        <div class="legend">
          <div class="legend-item" *ngFor="let segment of this.barSegments">
            <span class="legend-symbol" [style.backgroundColor]="segment.color"></span>
            <span class="legend-value" *ngIf="this.barSegments.length > 1">{{ segment.value | number }}</span>
            <span class="legend-label">{{ segment.label }}</span>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class BarGaugeComponent implements OnChanges, AfterViewInit {
  private static readonly BAR_GAUGE_COLORS: symbol = Symbol('Bar Gauge Colors');

  @ViewChild('maxValueBar', { read: ElementRef })
  public maxValueBar!: ElementRef;

  @ViewChildren('segmentBars', { read: ElementRef })
  public segmentBars!: QueryList<ElementRef>;

  @ContentChild(BarGaugeLegendDirective)
  public customLegend!: BarGaugeLegendDirective;

  @Input()
  public title?: string;

  @Input()
  public units?: string;

  @Input()
  public colorPaletteKey?: ColorPaletteKey;

  @Input()
  public maxValue?: number;

  @Input()
  public segments?: Segment[] = [];

  @Input()
  public isOverMaxBorderActive: boolean = true;

  @Input()
  public display: BarGaugeStyle = BarGaugeStyle.Regular;

  @Input()
  public isUnlimited: boolean = false;

  public barSegments: BarSegment[] = [];
  public totalValue: number = 0;
  public overMaxValue: boolean = false;
  public nearMaxValue: boolean = false;

  public constructor(
    private readonly domElementMeasurerService: DomElementMeasurerService,
    private readonly colorService: ColorService
  ) {
    this.colorService.registerColorPalette(BarGaugeComponent.BAR_GAUGE_COLORS, [Color.Blue7, Color.Blue4, Color.Blue2]);
  }

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.segments || changes.maxValue) {
      this.totalValue = this.calcTotalValueFromSegments(this.segments ?? []);
      this.barSegments = this.toBarSegments(this.segments ?? [], this.maxValue ?? 0);

      this.overMaxValue = this.maxValue !== undefined && this.totalValue > this.maxValue;
    }
  }

  public ngAfterViewInit(): void {
    this.checkNearMaxValue();
  }

  public checkNearMaxValue(): void {
    /*
     * On the far right of each segment is a small 1px white vertical bar used to indicate the end of the segment.
     * We want to remove it if we fill up the bar so that the bar actually looks full instead of cut off with the
     * divider against a white background. We do this by adding a class to display:none if we are within 1px of the
     * max width.
     */
    const lastSegment = this.domElementMeasurerService.measureHtmlElement(this.segmentBars.last.nativeElement);
    const maxValueBar = this.domElementMeasurerService.measureHtmlElement(this.maxValueBar.nativeElement);
    this.nearMaxValue = lastSegment.right >= maxValueBar.right - 1;
  }

  private toBarSegments(segments: Segment[], maxValue: number): BarSegment[] {
    const colors = this.colorService
      .getColorPalette(this.colorPaletteKey ?? BarGaugeComponent.BAR_GAUGE_COLORS)
      .forNColors(segments.length);

    return segments.map((segment: Segment, index: number) =>
      this.toBarSegment(segment, colors[index], getPercentage(segment.value, maxValue ?? 0))
    );
  }

  private toBarSegment(segment: Segment, color: string, percentage: number): BarSegment {
    return {
      ...segment,
      color: segment.color ?? color,
      percentage: percentage,
      hasClickHandler: !isNil(segment?.clickHandler),
      tooltip: segment.tooltip ?? `${segment.label}: ${segment.value}`
    };
  }

  private calcTotalValueFromSegments(segments: Segment[]): number {
    return segments.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0);
  }
}

export interface Segment {
  label: string;
  value: number;
  color?: string;
  tooltip?: string | TemplateRef<SegmentContext>;

  clickHandler?(segment: Segment): void;
}

interface BarSegment extends Segment {
  percentage: number;
  hasClickHandler: boolean;
}

export const enum BarGaugeStyle {
  Regular = 'regular',
  Compact = 'compact',
  SingleBar = 'single-bar',
  Distribution = 'distribution'
}

export interface SegmentContext {
  $implicit: Segment;
}

export interface CustomLegendContext {
  $implicit: Segment[];
}
