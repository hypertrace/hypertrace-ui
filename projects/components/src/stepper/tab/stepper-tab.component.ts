import { ChangeDetectionStrategy, Component, ContentChild, Input, OnChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { IconType } from '@hypertrace/assets-library';
import { BehaviorSubject, Observable } from 'rxjs';

import { CONTENT_HOLDER_TEMPLATE, ContentHolder } from '../../content/content-holder';
import { StepperTabControlsComponent } from '../tab-controls/stepper-tab-controls.component';

@Component({
  selector: `ht-stepper-tab`,
  template: CONTENT_HOLDER_TEMPLATE,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperTabComponent extends ContentHolder implements OnChanges {
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

  private readonly refreshSubject: BehaviorSubject<void> = new BehaviorSubject<void>(undefined);
  public readonly refresh$: Observable<void> = this.refreshSubject.asObservable();

  public ngOnChanges(): void {
    this.refreshSubject.next();
  }
}
