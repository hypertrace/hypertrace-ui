import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild
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
      <mat-stepper
        [orientation]="this.orientation"
        [linear]="this.isLinear"
        #stepper
        (selectionChange)="this.selectionChange.emit($event)"
      >
        <ng-container *ngFor="let step of steps">
          <mat-step [completed]="step.completed" [stepControl]="step.stepControl" [optional]="step.optional">
            <ng-template matStepLabel>
              <ht-label class="header-label" [label]="step.label"></ht-label>
            </ng-template>
            <ng-container *ngTemplateOutlet="step.content"></ng-container>
            <ng-template matStepperIcon="edit">
              <ht-icon [icon]="step.icon" size="${IconSize.ExtraSmall}"></ht-icon>
            </ng-template>
          </mat-step>
        </ng-container>
      </mat-stepper>
      <div class="action-buttons">
        <ht-button
          class="cancel"
          label="Cancel"
          (click)="this.cancelled.emit()"
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
            (click)="this.submitted.emit()"
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

  @ViewChild(MatStepper)
  private readonly stepper?: MatStepper;

  // If stepper is Linear, then we can navigate to a tab only if previous all tabs are at complete state.
  @Input()
  public isLinear: boolean = false;

  // Currently we only support horizontal orientation.
  @Input()
  public orientation: StepperOrientation = StepperOrientation.Horizontal;

  @Output()
  public readonly submitted: EventEmitter<void> = new EventEmitter();

  @Output()
  public readonly cancelled: EventEmitter<void> = new EventEmitter();

  @Output()
  public readonly selectionChange: EventEmitter<StepperSelectionChange> = new EventEmitter<StepperSelectionChange>();

  public steps$?: Observable<StepperTabComponent[]>;

  public ngAfterContentInit(): void {
    this.steps$ = queryListAndChanges$(this.steps).pipe(map(list => list.toArray()));
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

  /**
   * Navigate to a particular step using the index
   * @param index - index of the step to navigate to
   */
  public goToStep(index: number): void {
    const isIndexValid = index >= 0 && index < this.steps.length;
    const isNavigationAllowed = this.isLinear ? this.isStepCompleted(index) : true;
    if (isIndexValid && isNavigationAllowed && this.stepper) {
      this.stepper.selectedIndex = index;
    }
  }

  private isStepCompleted(index: number): boolean {
    const step = this.steps.get(index);

    return step?.completed ?? false;
  }
}

export enum StepperOrientation {
  Horizontal = 'horizontal'
}

export type StepperSelectionChange = StepperSelectionEvent;
