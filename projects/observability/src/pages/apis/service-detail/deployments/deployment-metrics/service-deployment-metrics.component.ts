import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TimeDuration } from '@hypertrace/common';
import { PredefinedTimeDurationService } from '@hypertrace/components';

@Component({
  styleUrls: ['./service-deployment-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="metrics-comparison">
      <div class="time-range-selector">
        <span> Select the time range to compare pre and post deployment metrics: </span>
        <ht-select [selected]="this.selectedTimeDuration" (selectedChange)="this.onTimeDurationChange($event)">
          <ht-select-option
            *ngFor="let timeDuration of this.predefinedTimeDurations"
            [value]="timeDuration"
            [label]="timeDuration.toLongString()"
          >
          </ht-select-option>
        </ht-select>
      </div>
      <div class="post-deployment-metrics">
        <div class="before-deployment-metrics">
          <p>Metrics {{ this.selectedTimeDuration.toLongString() }} before deployment completion</p>
          <ht-service-post-deployment-metrics
            [startTime]="this.getTimeBeforeDeployment()"
            [endTime]="this.deploymentEndTime"
          >
          </ht-service-post-deployment-metrics>
        </div>
        <div class="after-deployment-metrics">
          <p>Metrics {{ this.selectedTimeDuration.toLongString() }} after deployment completion</p>
          <ht-service-post-deployment-metrics
            [startTime]="this.deploymentEndTime"
            [endTime]="this.getTimeAfterDeployment()"
          >
          </ht-service-post-deployment-metrics>
        </div>
      </div>
    </div>
  `,
  selector: 'ht-service-deployment-metrics'
})
export class ServiceDeploymentMetricsComponent {
  public predefinedTimeDurations: TimeDuration[] = this.predefinedTimeDurationService.getPredefinedTimeDurations();
  public selectedTimeDuration: TimeDuration = this.predefinedTimeDurations[0];

  public constructor(private readonly predefinedTimeDurationService: PredefinedTimeDurationService) {}

  public onTimeDurationChange(newSelection: TimeDuration): void {
    this.selectedTimeDuration = newSelection;
  }

  @Input()
  public deploymentEndTime!: number;

  public getTimeBeforeDeployment(): number {
    return this.deploymentEndTime - this.selectedTimeDuration.toMillis();
  }

  public getTimeAfterDeployment(): number {
    return this.deploymentEndTime + this.selectedTimeDuration.toMillis();
  }
}
