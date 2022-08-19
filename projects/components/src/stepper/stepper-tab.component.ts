import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';

import { ContentHolder, CONTENT_HOLDER_TEMPLATE } from '../content/content-holder';

@Component({
  selector: `ht-stepper-tab`,
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperTabComponent extends ContentHolder {
  @Input()
  public label!: string;

  @Input()
  public icon?: string = IconType.Edit;

  @Input()
  public optional?: boolean = false;

  @Input()
  public completed?: boolean = true;

  @Input()
  public stepControl?: AbstractControl;
}
