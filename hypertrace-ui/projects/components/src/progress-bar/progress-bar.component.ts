import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Color } from '@hypertrace/common';

@Component({
  selector: 'ht-progress-bar',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress">
      <div class="progress-bar" [style.backgroundColor]="this.backgroundColor">
        <div class="bar" [style.width]="this.progress + '%'" [style.backgroundColor]="this.progressColor"></div>
      </div>
      <div *ngIf="this.showProgressPercentage" class="progress-percentage">{{ this.progress }}%</div>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input()
  public progress: number = 0; // Progress in percentage

  @Input()
  public backgroundColor: Color = Color.Gray3;

  @Input()
  public progressColor: Color = Color.Blue4;

  @Input()
  public showProgressPercentage: boolean = true;
}
