import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  styleUrls: ['./progress-circle.component.scss'],
  selector: 'ht-progress-circle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ht-progress-circle" [style.height]="this.getWidth()">
      <svg
        class="progress-circle"
        [attr.width]="this.getWidth()"
        [attr.height]="this.getWidth()"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="progress-circle-back"
          cx="50%"
          cy="50%"
          [attr.r]="this.radius"
          [attr.stroke]="this.colorLight"
        ></circle>
        <circle
          class="progress-circle-prog"
          cx="50%"
          cy="50%"
          [attr.r]="this.radius"
          [attr.stroke]="this.colorDark"
          [attr.stroke-dasharray]="this.dashLengthSubject | async"
        ></circle>
      </svg>
      <div class="progress-text">{{ this.percent | number: '1.0-0' }}</div>
    </div>
  `
})
export class ProgressCircleComponent implements OnInit {
  @Input()
  public percent: number = 0;

  @Input()
  public colorLight: string = '#e1f0ff';

  @Input()
  public colorDark: string = '#0081f1';

  @Input()
  public radius: number = 50;

  public getWidth(): string {
    return `${this.radius * 2 + 16}px`;
  }

  public dashLengthSubject: BehaviorSubject<string> = new BehaviorSubject<string>('0 999');

  public ngOnInit(): void {
    setTimeout(() => {
      this.getDashLength();
    }, 0);
  }

  public getDashLength(): void {
    const perimeter = 2 * Math.PI * this.radius;
    const dashLength = perimeter * (this.percent / 100);
    this.dashLengthSubject.next(`${dashLength} 999`);
  }
}
