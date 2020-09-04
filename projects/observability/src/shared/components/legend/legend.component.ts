import { ChangeDetectionStrategy, Component, Inject, InjectionToken, StaticProvider } from '@angular/core';

export const LEGEND_DATA = new InjectionToken<LegendData<unknown>>('LEGEND DATA');

@Component({
  selector: 'ht-legend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./legend.component.scss'],
  template: `
    <div class="legend-entries fill-container" [ngClass]="this.layoutClass">
      <div *ngFor="let entry of this.entries" class="legend-entry" [htTooltip]="entry.name">
        <span class="legend-symbol" [style.backgroundColor]="entry.color"></span>
        <span class="legend-label">{{ entry.name }}</span>
        <span *ngIf="entry.data.value !== undefined" class="legend-value">{{ entry.data.value }}</span>
      </div>
    </div>
  `
})
export class LegendComponent {
  public static buildProviders(legendData: LegendData<unknown>): StaticProvider[] {
    // Just a way of making this a little more type safe since providers are untyped
    return [
      {
        provide: LEGEND_DATA,
        useValue: legendData
      }
    ];
  }

  public get entries(): LegendSeries<unknown>[] {
    return this.legendData.series;
  }

  public get layoutClass(): string {
    switch (this.legendData.layout) {
      case LegendLayout.Row:
        return `legend-row position-${this.legendData.position}`;
      case LegendLayout.Column:
      default:
        return `legend-column position-${this.legendData.position}`;
    }
  }

  public constructor(@Inject(LEGEND_DATA) private readonly legendData: LegendData<unknown>) {}
}

export interface LegendSeries<T> {
  name: string;
  color: string;
  data: T;
}

export interface LegendData<T> {
  position: LegendPosition;
  layout: LegendLayout;
  series: LegendSeries<T>[];
}

export const enum LegendLayout {
  Row = 'row',
  Column = 'column'
}

export const enum LegendPosition {
  // Kabob case because these are used for css classes
  Bottom = 'bottom',
  Right = 'right',
  TopRight = 'top-right',
  TopLeft = 'top-left',
  Top = 'top',
  None = 'none'
}
