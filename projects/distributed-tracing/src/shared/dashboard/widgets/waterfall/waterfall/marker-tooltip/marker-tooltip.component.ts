import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'ht-marker-tooltip',
  styleUrls: ['./marker-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marker-tooltip-container" *ngIf="this.data | async as data">
      <div class="tooltip-header">
        <div class="log-count">
          Logs
          <div class="count">{{ data.relativeTimes.length }}</div>
        </div>
        <div class="time-range" *ngIf="data.relativeTimes.length > 0">
          <ng-container
            *ngIf="data.relativeTimes[0] === data.relativeTimes[data.relativeTimes.length - 1]; else rangeResult"
            >{{ data.relativeTimes[0] }}ms</ng-container
          >
          <ng-template #rangeResult
            >{{ data.relativeTimes[0] }}ms - {{ data.relativeTimes[data.relativeTimes.length - 1] }}ms</ng-template
          >
        </div>
      </div>
      <div class="divider"></div>
      <div class="summary">
        {{ data.summary }}
      </div>
      <div class="view-all">
        <div class="ellipsis">...</div>
        <div (click)="this.viewAll.emit()" class="view-all-text">View all ></div>
      </div>
    </div>
  `
})
export class MarkerTooltipComponent {
  @Input()
  public data?: Observable<MarkerTooltipData | undefined>;

  @Output()
  public readonly viewAll: EventEmitter<void> = new EventEmitter();
}

export interface MarkerTooltipData {
  relativeTimes: number[];
  summary: string;
}
