import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { ServiceInstrumentationService } from '../service-instrumentation.service';

@Component({
  styleUrls: ['./total-score.component.scss'],
  selector: 'ht-service-instrumentation-total-score',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-total-score">
      <ht-progress-circle
        [percent]="serviceScore"
        [colorLight]="scoreColors?.light"
        [colorDark]="scoreColors?.dark"
        [radius]="58"
      ></ht-progress-circle>

      <div class="info-container">
        <h4 class="heading">{{ this.getScoreLabel() }}</h4>

        <p class="description">
          {{ this.getScoreDescription() }}
        </p>

        <div class="legend">
          <div class="dot" *ngFor="let legendColor of this.legendColors; index as i">
            <span [style.background-color]="legendColor"></span>
            <label>{{ this.legendLabels[i] }}</label>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TotalScoreComponent implements OnChanges {
  @Input()
  public serviceScore: number = 0;

  public scoreColors: { light: string; dark: string } | undefined;

  public legendColors: string[] = ['#dc3d43', '#ffa01c', '#3d9a50'];
  public legendLabels: string[] = ['0-49', '50-69', '70-100'];

  public constructor(private readonly serviceInstrumentationService: ServiceInstrumentationService) {}

  public ngOnChanges(): void {
    this.scoreColors = this.serviceInstrumentationService.getColorForScore(this.serviceScore);
  }

  public getScoreLabel(): string {
    return this.serviceInstrumentationService.getLabelForScore(this.serviceScore);
  }

  public getScoreDescription(): string {
    return this.serviceInstrumentationService.getDescriptionForScore(this.serviceScore);
  }
}
