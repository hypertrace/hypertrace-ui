import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { ServiceInstrumentationService } from '../service-instrumentation.service';

@Component({
  styleUrls: ['./progress-bar.component.scss'],
  selector: 'ht-service-instrumentation-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-progress-bar">
      <div class="score-info">
        <label>{{ this.label }}</label>
        <p class="score">
          {{ this.floor(this.score) }}
        </p>
      </div>

      <ht-progress-bar [percent]="this.score" [fillColor]="this.scoreColor"></ht-progress-bar>
    </div>
  `
})
export class ProgressBarComponent implements OnInit {
  @Input()
  public score: number = 0;

  @Input()
  public label: string = 'Score';

  public scoreColor: string = '';

  public constructor(private readonly serviceInstrumentationService: ServiceInstrumentationService) {}

  public ngOnInit(): void {
    this.scoreColor = this.serviceInstrumentationService.getColorForScore(this.score).dark;
  }

  public floor(num: number): number {
    return Math.floor(num);
  }
}
