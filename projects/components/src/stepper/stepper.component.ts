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
import { queryListAndChanges$, SubscriptionLifecycle } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { merge, Observable, of, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
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
          <-- NOTE: completed and step control both should not be present when in linear flow. So when step control is
          provided, we explicitly set completed to false so that the stepper can work with teh form validity status -->
          <mat-step
            [completed]="step.stepControl ? false : step.completed"
            [stepControl]="step.stepControl"
            [optional]="step.optional"
          >
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
            [label]="this.getActionButtonLabel | htMemoize: stepper.selectedIndex:steps"
            (click)="this.nextOrSubmit(stepper)"
            [disabled]="this.isNextDisabled$ | async"
          ></ht-button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements AfterContentInit {
  // TODO: Fix support for custom icon, currently broken.

  @ContentChildren(StepperTabComponent)
  private readonly steps!: QueryList<StepperTabComponent>;

  @ViewChild(MatStepper)
  private readonly stepper?: MatStepper;

  /**
   * If stepper is Linear, then we can navigate to a tab only if previous all tabs are at complete state.
   */
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

  public isNextDisabled$: Observable<boolean> = of(false);

  public ngAfterContentInit(): void {
    this.steps$ = queryListAndChanges$(this.steps).pipe(map(list => list.toArray()));

    /**
     * Inorder to get the next/submit button disabled status, we need to listen to the primary triggers for change:
     * 1. Stepper Initialization
     * 2. Selection Change
     *
     * When either of these happens, we need to check if a step control is provided for the step. If a step control is provided, we
     * switch to the form status changes inorder to find if the form is valid or not.
     *
     * If there is no step control provided, we can check for the step completed property.
     *
     * Since the same observable is used for both the disabled handling of submit and the next button,
     * we switch between two logic:
     * - For next: If the stepper is linear and the step is valid
     * - For Submit: If all the steps are valid
     */
    this.isNextDisabled$ = merge(
      this.selectionChange.pipe(map(({ selectedStep }) => selectedStep)),
      this.steps$.pipe(map(([firstStep]) => firstStep))
    ).pipe(
      switchMap(step => {
        if (!isNil(step.stepControl)) {
          return step.stepControl.statusChanges.pipe(
            startWith(step.stepControl.status),
            map(() => step.stepControl?.status),
            /**
             * For some reason, the `statusChanges` doesn't reflect the correct status. So we are accessing the `status`
             * property on the form itself in the next cycle by using `timer(0)`. This way we get the correct
             * status.
             * FIXME: Find a better approach
             */
            switchMap(() => timer(0).pipe(map(() => step.stepControl?.status))),
            map(status => status === 'VALID')
          );
        }

        return of(step.completed);
      }),
      debounceTime(100), // <-- debounce to avoid multiple emits,
      distinctUntilChanged(),
      map(valid => {
        const isLastStep = this.stepper ? this.stepper?.selectedIndex === this.stepper?.steps.length - 1 : true;
        const isNextDisabled = this.isLinear && !valid;
        const isSubmitDisabled = !this.areAllStepsValid();

        return isLastStep ? isSubmitDisabled : isNextDisabled;
      })
    );
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

  public nextOrSubmit(stepper: MatStepper): void {
    const isLastStep = stepper.selectedIndex === stepper.steps.length - 1;
    isLastStep ? this.submitted.emit() : stepper.next();
  }

  public getActionButtonLabel(selectedIndex: number, steps: StepperTabComponent[]): string {
    const isLastStep = selectedIndex === steps.length - 1;

    return steps[selectedIndex]?.actionButtonLabel ?? (isLastStep ? 'Submit' : 'Next');
  }

  private isStepCompleted(index: number): boolean {
    const step = this.steps.get(index);
    if (!step) {
      return false;
    }

    return step.stepControl?.valid ?? step.completed;
  }

  /**
   * Check if all the steps are valid.
   * If the step has a step control , we check the forms validity and if not, we check the step completed property.
   */
  private areAllStepsValid(): boolean {
    return this.steps.toArray().every((_, index) => this.isStepCompleted(index));
  }
}

export enum StepperOrientation {
  Horizontal = 'horizontal'
}

export type StepperSelectionChange = StepperSelectionEvent;
