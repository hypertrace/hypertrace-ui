import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { getPercentage, TypedSimpleChanges } from '@hypertrace/common';

@Component({
  selector: 'ht-bar-gauge',
  styleUrls: ['./bar-gauge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bar-gauge">
      <div *ngIf="this.title" class="title">{{ this.title | htDisplayTitle }}</div>
      <div class="count">
        {{ this.totalValue | number }} / {{ this.maxValue | number }}
        <span class="units" *ngIf="this.units">{{ this.units }}</span>
      </div>
      <div class="bar">
        <div #maxValueBar class="max-value-bar" [ngClass]="{ 'over-max-value': this.overMaxValue }">
          <div #segmentBars class="segment-bars">
            <div
              *ngFor="let segment of this.barSegments"
              class="segment-bar"
              [ngClass]="{ 'hide-divider': this.nearMaxValue }"
              [style.background]="segment.color"
              [style.width.%]="segment.percentage"
            >
              <div class="divider"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BarGaugeComponent implements OnChanges {
  @ViewChild('maxValueBar', { read: ElementRef })
  public maxValueBar!: ElementRef;

  @ViewChild('segmentBars', { read: ElementRef })
  public segmentBars!: ElementRef;

  @Input()
  public title?: string;

  @Input()
  public units?: string;

  @Input()
  public maxValue?: number;

  @Input()
  public segments?: Segment[] = [];

  public barSegments: BarSegment[] = [];
  public totalValue: number = 0;
  public overMaxValue: boolean = false;
  public nearMaxValue: boolean = false;

  public ngOnChanges(changes: TypedSimpleChanges<this>): void {
    if (changes.segments || changes.maxValue) {
      this.totalValue = this.calcTotalValueFromSegments(this.segments ?? []);
      this.barSegments = this.toBarSegments(this.segments ?? [], this.maxValue ?? 0);

      this.overMaxValue = this.maxValue !== undefined && this.totalValue > this.maxValue;

      this.checkNearMaxValue();
    }
  }

  private checkNearMaxValue(): void {
    setTimeout(() => {
      /*
       * We want to remove the white divider if we fill up the bar. Compare segments to
       * max bar width minus 2px for the divider width.
       */
      this.nearMaxValue = this.segmentBars.nativeElement.offsetWidth >= this.maxValueBar.nativeElement.offsetWidth - 2;
    });
  }

  private toBarSegments(segments: Segment[], maxValue: number): BarSegment[] {
    return segments.map(segment => this.toBarSegment(segment, getPercentage(segment.value, maxValue ?? 0)));
  }

  private toBarSegment(segment: Segment, percentage: number): BarSegment {
    return {
      ...segment,
      percentage: percentage
    };
  }

  private calcTotalValueFromSegments(segments: Segment[]): number {
    return segments.reduce((previousValue, currentValue) => previousValue + currentValue.value, 0);
  }
}

export interface Segment {
  value: number;
  color?: string;
  label?: string; // Currently unused, but will be used for legend when added
}

interface BarSegment extends Segment {
  percentage: number;
}
