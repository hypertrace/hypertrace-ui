import { ChangeDetectionStrategy, Component, Inject, InjectionToken } from '@angular/core';
import { Summary } from '../../chart';

export const SUMMARIES_DATA = new InjectionToken<number>('SUMMARIES_DATA');

@Component({
  selector: 'ht-cartesian-summary',
  styleUrls: ['./cartesian-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="summary-control" *ngIf="this.summaries.length > 0">
      <div class="summary" *ngFor="let summary of this.summaries">
        {{ summary.value | htcDisplayNumber }}
      </div>
    </div>
  `
})
export class CartesianSummaryComponent {
  public constructor(@Inject(SUMMARIES_DATA) public readonly summaries: Summary[]) {}
}
