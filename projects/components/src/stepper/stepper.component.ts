import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { queryListAndChanges$ } from '@hypertrace/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ButtonRole, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { StepperTabComponent } from './stepper-tab.component';

@Component({
  selector: 'ht-stepper',
  template: `
    <div class="stepper" *htLoadAsync="this.steps$ as steps">
      <mat-stepper [orientation]="this.orientation" [linear]="this.isLinear" #stepper>
        <ng-container *ngFor="let step of steps">
          <mat-step [completed]="step.completed" [stepControl]="step.stepControl" [optional]="step.optional">
            <ng-template matStepLabel>
              <ht-label class="header-label" [label]="step.label"></ht-label>
            </ng-template>
            <ng-container *ngTemplateOutlet="step.content"></ng-container>
            <ng-template matStepperIcon="edit">
              <ht-icon [icon]="step.icon" size="${IconSize.ExtraSmall}"> </ht-icon>
            </ng-template>
          </mat-step>
        </ng-container>
      </mat-stepper>
      <div class="action-buttons">
        <ht-button
          class="cancel"
          label="Cancel"
          (click)="this.onClickCancel()"
          role="${ButtonRole.Tertiary}"
        ></ht-button>
        <div class="back-next">
          <ht-button
            class="back"
            *ngIf="stepper.selectedIndex !== 0"
            display="${ButtonStyle.Outlined}"
            label="Back"
            (click)="stepper.previous()"
          ></ht-button>
          <ht-button
            class="next"
            *ngIf="stepper.selectedIndex !== steps.length - 1"
            label="Next"
            (click)="stepper.next()"
            [disabled]="this.isNextDisabled(stepper)"
          ></ht-button>
          <ht-button
            class="submit"
            *ngIf="stepper.selectedIndex === steps.length - 1"
            label="Submit"
            (click)="this.onClickSubmit()"
            [disabled]="this.isSubmitDisabled(stepper)"
          ></ht-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements AfterContentInit {
  // TODO: Fix support for custom icon, currently broken.

  @ContentChildren(StepperTabComponent)
  private readonly steps!: QueryList<StepperTabComponent>;

  // If stepper is Linear, then we can navigate to a tab only if previous all tabs are at complete state.
  @Input()
  public isLinear: boolean = false;

  // Currently we only support horizontal orientation.
  @Input()
  public orientation: StepperOrientation = StepperOrientation.Horizontal;

  // True for submit, false for cancel.
  @Output()
  public readonly submit: EventEmitter<boolean> = new EventEmitter();

  public steps$?: Observable<StepperTabComponent[]>;

  public ngAfterContentInit(): void {
    this.steps$ = queryListAndChanges$(this.steps).pipe(map(list => list.toArray()));
  }

  public onClickSubmit(): void {
    this.submit.emit(true);
  }

  public onClickCancel(): void {
    this.submit.emit(false);
  }

  // TODO: can be made a directive
  public isNextDisabled(stepper: MatStepper): boolean {
    const selectedStep = stepper.steps.get(stepper.selectedIndex);
    const formValid = selectedStep?.stepControl?.valid;
    const stepCompleted = selectedStep?.completed;

    return this.isLinear && !stepCompleted && !formValid;
  }

  // TODO: can be made a directive
  public isSubmitDisabled(stepper: MatStepper): boolean {
    const selectedStep = stepper.steps.get(stepper.selectedIndex);
    const formValid = selectedStep?.stepControl?.valid;
    const stepCompleted = selectedStep?.completed;

    return !stepCompleted && !formValid;
  }
}

export enum StepperOrientation {
  Horizontal = 'horizontal'
}
