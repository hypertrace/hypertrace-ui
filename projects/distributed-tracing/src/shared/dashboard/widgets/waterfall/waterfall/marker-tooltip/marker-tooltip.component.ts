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
      <div
        class="attribute"
        *ngFor="let attribute of data.attributes | slice: 0:${MarkerTooltipComponent.MAX_ATTRIBUTES_TO_DISPLAY}"
      >
        <div class="key">{{ attribute[0] }}:</div>
        <div class="value">{{ attribute[1] }}</div>
      </div>
      <div
        class="view-all"
        *ngIf="!!data.attributes && data.attributes.length > ${MarkerTooltipComponent.MAX_ATTRIBUTES_TO_DISPLAY}"
      >
        <div class="ellipsis">...</div>
        <div (click)="this.viewAll.emit(true)" class="view-all-text">View all ></div>
      </div>
    </div>
  `
})
export class MarkerTooltipComponent {
  public static readonly MAX_ATTRIBUTES_TO_DISPLAY: number = 5;

  @Input()
  public data?: Observable<MarkerTooltipData | undefined>;

  @Output()
  public readonly viewAll: EventEmitter<boolean> = new EventEmitter();
}

export interface MarkerTooltipData {
  relativeTimes: number[];
  attributes: [string, unknown][];
}
