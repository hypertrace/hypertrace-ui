import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { XMoreDisplay } from '../x-more/x-more.component';

@Component({
  selector: 'ht-string-array-display',
  styleUrls: ['./string-array-display.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="string-array-cell" [htTooltip]="summaryTooltip" *ngIf="this.values?.length > 0">
      <span class="first-item">{{ this.values[0] | htDisplayString }}</span>
      <ht-x-more [count]="(this.values | slice: 1).length" displayStyle="${XMoreDisplay.Gray}"></ht-x-more>

      <ng-template #summaryTooltip>
        <div *ngFor="let value of this.values">{{ value }}</div>
      </ng-template>
    </div>
  `
})
export class StringArrayDisplayComponent {
  @Input()
  public values: string[] = [];
}
