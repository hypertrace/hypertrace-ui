import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ServiceInstrumentationService } from '../service-instrumentation.service';

@Component({
  selector: 'ht-service-instrumentation-category-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="service-instrumentation-org-score">
      <div>
        <h5 class="heading">Razorpay Average</h5>
        <p class="score">
          {{ this.orgScore | number: '1.0-0' }}
          <span class="label" [style.color]="this.scoreColor">{{ this.scoreLabel }}</span>
        </p>
      </div>
    </div>
  `
})
export class CategoryCardComponent {
  @Input()
  public orgScore: number = 0;

  public scoreLabel: string = '';
  public scoreColor: string = '';

  public constructor(private readonly serviceInstrumentationService: ServiceInstrumentationService) {
    this.scoreLabel = this.serviceInstrumentationService.getLabelForScore(this.orgScore);
    this.scoreColor = this.serviceInstrumentationService.getColorForScore(this.orgScore).dark;
  }
}
