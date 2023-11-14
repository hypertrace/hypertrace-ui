import { ChangeDetectionStrategy, Component, ContentChild, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';

import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../../content/content-holder';
import { StepperTabControlsComponent } from '../tab-controls/stepper-tab-controls.component';

@Component({
  selector: `ht-stepper-tab`,
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperTabComponent extends ContentHolder {
  @ContentChild(StepperTabControlsComponent)
  public tabControls?: StepperTabControlsComponent;

  @Input()
  public label?: string;

  @Input()
  public icon: string = IconType.Edit;

  @Input()
  public optional: boolean = false;

  @Input()
  public editable: boolean = true;

  @Input()
  public completed: boolean = true;

  @Input()
  public stepControl?: AbstractControl;

  @Input()
  public actionButtonLabel?: string;
}
