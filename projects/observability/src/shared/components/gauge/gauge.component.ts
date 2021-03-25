import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges } from '@angular/core';
import { Color, DomElementMeasurerService, Point } from '@hypertrace/common';
import { Arc, arc, DefaultArcObject } from 'd3-shape';
import { String } from 'lodash';

@Component({
  selector: 'ht-gauge',
  template: `
    <div class="gauge-container" (htLayoutChange)="this.onLayoutChange()">
      <svg class="gauge" *ngIf="this.rendererData">
        <g attr.transform="translate({{ rendererData.origin.x }}, {{ rendererData.origin.y }})">
          <path class="gauge-ring" [attr.d]="rendererData.backgroundArc" *ngIf="rendererData.radius > 80" />
          <g
            class="input-data"
            *ngIf="rendererData.data"
            htTooltip="{{ rendererData.data.value }} of {{ rendererData.data.maxValue }}"
          >
            <path
              class="value-ring"
              *ngIf="rendererData.radius > ${GaugeComponent.GAUGE_MIN_RADIUS_TO_SHOW_PATH}"
              [attr.d]="rendererData.data.valueArc"
              [attr.fill]="rendererData.data.color"
            />
            <text x="0" y="0" class="value-display" [attr.fill]="rendererData.data.color">
              {{ rendererData.data.value }}
            </text>
            <text x="0" y="24" class="label-display">{{ rendererData.data.label }}</text>
          </g>
        </g>
      </svg>
    </div>
  `,
  styleUrls: ['./gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeComponent implements OnChanges {
  private static readonly GAUGE_RING_WIDTH: number = 15;
  private static readonly GAUGE_ARC_CORNER_RADIUS: number = 10;
  private static readonly GAUGE_MIN_RADIUS_TO_SHOW_PATH: number = 80;
  private static readonly EXTRA_ARC_ANGLE: number = Math.PI / 12;

  @Input()
  public value?: number;

  @Input()
  public maxValue?: number;

  @Input()
  public thresholds: GaugeThreshold[] = [];

  @Input()
  public defaultLabel?: string;

  @Input()
  public defaultColor?: Color | string;

  public rendererData?: GaugeSvgRendererData;

  public constructor(
    public readonly elementRef: ElementRef,
    private readonly domElementMeasurerService: DomElementMeasurerService
  ) {}

  public ngOnChanges(): void {
    this.rendererData = this.buildRendererData();
  }

  public onLayoutChange(): void {
    this.rendererData = this.buildRendererData();
  }

  private buildRendererData(): GaugeSvgRendererData | undefined {
    const inputData = this.calculateInputData();
    if (!inputData) {
      return undefined;
    }

    const boundingBox = this.domElementMeasurerService.measureHtmlElement(this.elementRef.nativeElement);
    const radius = this.buildRadius(boundingBox);

    return {
      origin: this.buildOrigin(boundingBox.width, radius),
      radius: radius,
      backgroundArc: this.buildBackgroundArc(radius),
      data: this.buildGaugeData(radius, inputData)
    };
  }

  private buildBackgroundArc(radius: number): string {
    return this.buildArcGenerator()({
      innerRadius: radius - GaugeComponent.GAUGE_RING_WIDTH,
      outerRadius: radius,
      startAngle: -Math.PI / 2 - GaugeComponent.EXTRA_ARC_ANGLE,
      endAngle: Math.PI / 2 + GaugeComponent.EXTRA_ARC_ANGLE
    })!;
  }

  private buildGaugeData(radius: number, inputData?: GaugeInputData): GaugeData | undefined {
    if (inputData === undefined) {
      return undefined;
    }

    return {
      valueArc: this.buildValueArc(radius, inputData),
      ...inputData
    };
  }

  private buildValueArc(radius: number, inputData: GaugeInputData): string {
    const startAngle = -(Math.PI / 2 + GaugeComponent.EXTRA_ARC_ANGLE);

    return this.buildArcGenerator()({
      innerRadius: radius - GaugeComponent.GAUGE_RING_WIDTH,
      outerRadius: radius,
      startAngle: startAngle,
      endAngle: startAngle + 2 * (inputData.value / inputData.maxValue) * -startAngle
    })!;
  }

  private buildArcGenerator(): Arc<unknown, DefaultArcObject> {
    return arc().cornerRadius(GaugeComponent.GAUGE_ARC_CORNER_RADIUS);
  }

  private buildRadius(boundingBox: ClientRect): number {
    const width = boundingBox.width;
    const height = boundingBox.height;

    if (height > width / 2) {
      /**
       * Since height > width > 2, radius can be treated as (width / 2), but only for semi-circles
       *
       * If there is an extra angle added to the semicircle,
       * radius + extra arc length can over shoots the height
       *
       * If radius + extra arc length over shoots the height, then radius
       * needs to be calculated using the provided height, instead of width / 2
       */
      const radius = width / 2;
      const extraArcHeight = this.calculateExtraArcLength(radius);

      return extraArcHeight + radius <= height ? radius : this.calculateRadius(height);
    }

    return this.calculateRadius(height);
  }

  private buildOrigin(width: number, radius: number): Point {
    return {
      x: width / 2,
      y: radius
    };
  }

  private calculateInputData(): GaugeInputData | undefined {
    if (this.value !== undefined && this.maxValue !== undefined && this.maxValue > 0 && this.thresholds.length > 0) {
      const currentThreshold = this.thresholds.find(
        threshold => this.value! >= threshold.start && this.value! <= threshold.end
      );

      if (currentThreshold) {
        return {
          value: this.value,
          maxValue: this.maxValue,
          label: currentThreshold.label,
          color: currentThreshold.color
        };
      }
    } else if (
      this.value !== undefined &&
      this.maxValue !== undefined &&
      this.defaultColor !== undefined &&
      this.defaultColor !== undefined
    ) {
      return {
        value: this.value,
        maxValue: this.maxValue,
        label: this.defaultColor,
        color: this.defaultColor
      };
    }
  }

  private calculateExtraArcLength(radius: number): number {
    return radius * GaugeComponent.EXTRA_ARC_ANGLE;
  }

  /**
   * We want to fit gauge within a specified height
   * Approximating arc length, as the extra height required
   * to render the EXTRA_ARC_ANGLE in the gauge
   *
   * height = radius + arc length
   * height = radius + radius * EXTRA_ARC_ANGLE
   * radius = height / (1 + EXTRA_ARC_ANGLE)
   */

  private calculateRadius(height: number): number {
    return height / (1 + GaugeComponent.EXTRA_ARC_ANGLE);
  }
}

export interface GaugeThreshold {
  label: string;
  start: number;
  end: number;
  color: Color | string;
}

interface GaugeSvgRendererData {
  origin: Point;
  radius: number;
  backgroundArc: string;
  data?: GaugeData;
}

interface GaugeData {
  valueArc: string;
  value: number;
  maxValue: number;
  color: Color | string;
  label: string;
}

interface GaugeInputData {
  value: number;
  maxValue: number;
  label: string;
  color: Color | string;
}
