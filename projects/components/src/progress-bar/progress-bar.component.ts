import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  styleUrls: ['./progress-bar.component.scss'],
  selector: 'ht-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-progress-bar">
      <span [ngStyle]="{ 'width.%': this.percent, 'background-color': this.fillColor }"></span>
    </div>
  `
})
export class ProgressBarComponent {
  @Input()
  public percent: number = 0;

  @Input()
  public fillColor: string = '#0081f1';
}
