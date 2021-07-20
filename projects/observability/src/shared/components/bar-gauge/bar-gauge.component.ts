import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnChanges,
  QueryList,
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

@Component({
  selector: 'ht-bar-gauge',
  styleUrls: ['./bar-gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-gauge" (htLayoutChange)="this.checkNearMaxValue()">
      <div class="header-data" [ngClass]="this.display">
        <div *ngIf="this.title" class="title">{{ this.title | htDisplayTitle }}</div>
        <div class="count">
          <span>{{ this.totalValue | number }}</span>
          <span class="units" *ngIf="this.units && this.isUnlimited"> {{ this.units }}</span>
          <span> / </span>
          <span *ngIf="!this.isUnlimited">{{ this.maxValue | number }}</span>
          <span class="unlimited-symbol" *ngIf="this.isUnlimited">&#8734;</span>
          <span class="units" *ngIf="this.units && !this.isUnlimited"> {{ this.units }}</span>
        </div>
      </div>
      <div class="bar">
        <div #maxValueBar class="max-value-bar" [ngClass]="{ 'over-max-value': this.overMaxValue }">
          <div class="segment-bars">
            <div
              #segmentBars
              *ngFor="let segment of this.barSegments"
              class="segment-bar"
              [ngClass]="{ 'hide-last-divider': this.nearMaxValue }"
              [style.background]="segment.color"
              [style.width.%]="segment.percentage"
            >
              <div class="divider"></div>
            </div>
          </div>
        </div>
      </div>
      <div *ngIf="this.display === '${BarGaugeStyle.Regular}'" class="legend">
        <div class="legend-item" *ngFor="let segment of this.barSegments">
          <span class="legend-symbol" [style.backgroundColor]="segment.color"></span>
          <span class="legend-value" *ngIf="this.barSegments.length > 1">{{ segment.value | number }}</span>
          <span class="legend-label">{{ segment.label }}</span>
        </div>
      </div>
    </div>
  `
})
export class BarGaugeComponent implements OnChanges, AfterViewInit {
  private static readonly BAR_GAUGE_COLORS: symbol = Symbol('Bar Gauge Colors');

  @ViewChild('maxValueBar', { read: ElementRef })
  public maxValueBar!: ElementRef;

  @ViewChildren('segmentBars', { read: ElementRef })
  public segmentBars!: QueryList<ElementRef>;

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
      percentage: percentage
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
}

interface BarSegment extends Segment {
  percentage: number;
}

export const enum BarGaugeStyle {
  Regular = 'regular',
  Compact = 'compact'
}
