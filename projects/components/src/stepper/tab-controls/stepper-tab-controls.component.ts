import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../content/content-holder';
import { StepperComponent } from '../stepper.component';
import { StepperTabComponent } from '../tab/stepper-tab.component';

@Component({
  selector: 'ht-stepper-tab-controls',
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperTabControlsComponent extends ContentHolder {
  public constructor(public stepper: StepperComponent, public step: StepperTabComponent) {
    super();
  }

  public next(): void {
    this.stepper?.next();
  }

  public previous(): void {
    this.stepper?.previous();
  }
}
