import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges } from '@angular/core';
import { Color, Point } from '@hypertrace/common';
import { Arc, arc, DefaultArcObject } from 'd3-shape';

@Component({
  selector: 'ht-gauge',
  template: `
    <div class="gauge-container" (htLayoutChange)="this.onLayoutChange()">
      <svg class="gauge" *ngIf="this.rendererData">
        <g attr.transform="translate({{ rendererData.origin.x }}, {{ rendererData.origin.y }})">
          <path
            class="gauge-ring"
            [attr.d]="rendererData.backgroundArc"
            *ngIf="rendererData.radius > 80"
          />
          <g
            class="input-data"
            *ngIf="rendererData.data"
            htTooltip="{{ rendererData.data.value }} of {{ rendererData.data.maxValue }}"
          >
            <path
              class="value-ring"
              *ngIf="rendererData.radius > ${GaugeComponent.GAUGE_MIN_RADIUS_TO_SHOW_PATH}"
              [attr.d]="rendererData.data.valueArc"
              [attr.fill]="rendererData.data.threshold.color"
            />
            <text x="0" y="0" class="value-display" [attr.fill]="rendererData.data.threshold.color">
              {{ rendererData.data.value }}
            </text>
            <text x="0" y="24" class="label-display">{{ rendererData.data.threshold.label }}</text>
          </g>
        </g>
      </svg>
    </div>
  `,
  styleUrls: ['./gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GaugeComponent implements OnChanges {
  private static readonly GAUGE_RING_WIDTH: number = 20;
  private static readonly GAUGE_ARC_CORNER_RADIUS: number = 10;
  private static readonly GAUGE_AXIS_PADDING: number = 30;
  private static readonly GAUGE_MIN_RADIUS_TO_SHOW_PATH: number = 80;

  @Input()
  public value?: number;

  @Input()
  public maxValue?: number;

  @Input()
  public thresholds: GaugeThreshold[] = [];

  public rendererData?: GaugeSvgRendererData;

  public constructor(public readonly elementRef: ElementRef) {}

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

    const boundingBox = this.elementRef.nativeElement.getBoundingClientRect();
    const radius = this.buildRadius(boundingBox);

    return {
      origin: this.buildOrigin(boundingBox),
      radius: radius,
      backgroundArc: this.buildBackgroundArc(radius),
      data: this.buildGaugeData(radius, inputData)
    };
  }

  private buildBackgroundArc(radius: number): string {
    return this.buildArcGenerator()({
      innerRadius: radius - GaugeComponent.GAUGE_RING_WIDTH,
      outerRadius: radius,
      startAngle: -Math.PI / 2,
      endAngle: Math.PI / 2
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
    return this.buildArcGenerator()({
      innerRadius: radius - GaugeComponent.GAUGE_RING_WIDTH,
      outerRadius: radius,
      startAngle: -Math.PI / 2,
      endAngle: -Math.PI / 2 + (inputData.value / inputData.maxValue) * Math.PI
    })!;
  }

  private buildArcGenerator(): Arc<unknown, DefaultArcObject> {
    return arc().cornerRadius(GaugeComponent.GAUGE_ARC_CORNER_RADIUS);
  }

  private buildRadius(boundingBox: ClientRect): number {
    return Math.min(boundingBox.height - GaugeComponent.GAUGE_AXIS_PADDING, boundingBox.width / 2);
  }

  private buildOrigin(boundingBox: ClientRect): Point {
    return {
      x: boundingBox.width / 2,
      y: boundingBox.height - GaugeComponent.GAUGE_AXIS_PADDING
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
          threshold: currentThreshold
        };
      }
    }
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
  threshold: GaugeThreshold;
}

interface GaugeInputData {
  value: number;
  maxValue: number;
  threshold: GaugeThreshold;
}
