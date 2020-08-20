import { ChangeDetectionStrategy, Component, ContentChildren, QueryList, Input } from '@angular/core';
import { DateFormatMode, DateFormatOptions } from '@hypertrace/common';
import { TimelineCardContainerComponent } from './container/timeline-card-container.component';

@Component({
  selector: 'ht-timeline-card-list',
  template: `
    <div class="ht-timeline-card-list">
      <div class="record" *ngFor="let card of this.cards; index as index">
        <div class="time">
          <div class="value">{{ card.timestamp | htcDisplayDate: this.dateFormat }}</div>
          <div class="vertical-line"></div>
        </div>
        <div class="card" [ngClass]="{ 'selected-card': index === this.selectedIndex }">
          <ng-container *ngTemplateOutlet="card.content"></ng-container>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./timeline-card-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCardListComponent {
  @Input()
  public selectedIndex?: number;

  @ContentChildren(TimelineCardContainerComponent)
  public readonly cards!: QueryList<TimelineCardContainerComponent>;

  public readonly dateFormat: DateFormatOptions = {
    mode: DateFormatMode.TimeWithSeconds
  };
}
