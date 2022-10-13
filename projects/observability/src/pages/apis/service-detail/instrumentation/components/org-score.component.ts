import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  styleUrls: ['./org-score.component.scss'],
  selector: 'ht-service-instrumentation-org-score',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-org-score">
      <div>
        <h5 class="heading">Organization Score</h5>
        <p class="score">
          {{ this.orgScore | number: '1.0-0' }}
          <span class="label" [style.color]="this.getScoreComment().color">{{ this.getScoreComment().text }}</span>
        </p>
      </div>
    </div>
  `
})
export class OrgScoreComponent {
  @Input()
  public serviceScore: number = 0;

  @Input()
  public orgScore: number = 0;

  public getScoreComment(): { text: string; color: string } {
    if (this.serviceScore > this.orgScore) {
      return { text: 'The service score is above the org score', color: '#3d9a50' };
    }

    if (this.serviceScore === this.orgScore) {
      return { text: 'The service score matches the org score', color: '#3d9a50' };
    }

    return { text: 'The service score is below the org score', color: '#dc3d43' };
  }
}
