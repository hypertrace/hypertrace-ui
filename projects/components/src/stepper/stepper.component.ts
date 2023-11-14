import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { IconType } from '@hypertrace/assets-library';
import { queryListAndChanges$, SubscriptionLifecycle } from '@hypertrace/common';
import { isNil } from 'lodash-es';
import { merge, Observable } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ButtonVariant, ButtonStyle } from '../button/button';
import { IconSize } from '../icon/icon-size';
import { StepperTabComponent } from './tab/stepper-tab.component';

@Component({
  selector: 'ht-stepper',
  template: `
    <div class="stepper" *htLoadAsync="this.steps$ as steps">
      <mat-stepper
        role="tablist"
        [orientation]="this.orientation"
        [linear]="this.isLinear"
        #stepper
        (selectionChange)="this.selectionChange.emit($event)"
      >
        <ng-container *ngFor="let step of steps">
          <-- NOTE: completed and step control both should not be present when in linear flow. So when step control is
          provided, we explicitly set completed to false so that the stepper can work with teh form validity status -->
          <mat-step
            [completed]="step?.stepControl?.valid ?? step.completed"
            [stepControl]="step?.stepControl"
            [optional]="step.optional"
            [editable]="step.editable"
          >
            <ng-template matStepLabel>
              <ht-label class="header-label" [label]="step.label"></ht-label>
            </ng-template>
            <ng-container *ngTemplateOutlet="step.content"></ng-container>
            <ng-template matStepperIcon="edit">
              <ht-icon icon="${IconType.Edit}" size="${IconSize.ExtraSmall}"></ht-icon>
            </ng-template>
            <ng-template matStepperIcon="done">
              <ht-icon icon="${IconType.Done}" size="${IconSize.ExtraSmall}"></ht-icon>
            </ng-template>
          </mat-step>
        </ng-container>
      </mat-stepper>
      <footer class="footer">
        <ng-container
          *ngIf="steps[this.stepper.selectedIndex].tabControls as customTabControl; else defaultTabControlTpl"
        >
          <ng-container *ngTemplateOutlet="customTabControl.content"></ng-container>
        </ng-container>
        <ng-template #defaultTabControlTpl>
          <div class="action-buttons">
            <ht-button
              class="cancel"
              label="Cancel"
              (click)="this.cancelled.emit()"
              variant="${ButtonVariant.Tertiary}"
            ></ht-button>
            <div class="back-next">
              <ht-button
                class="back"
                *ngIf="stepper.selectedIndex !== 0"
                display="${ButtonStyle.Outlined}"
                label="Back"
                ariaLabel="Back"
                (click)="stepper.previous()"
              ></ht-button>
              <ht-button
                class="next"
                ariaLabel="Next"
                [label]="this.getActionButtonLabel | htMemoize: stepper.selectedIndex:steps"
                (click)="this.nextOrSubmit(stepper)"
                [disabled]="this.isNextDisabled(stepper.selectedIndex)"
              ></ht-button>
            </div>
          </div>
        </ng-template>
      </footer>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SubscriptionLifecycle],
  styleUrls: ['./stepper.component.scss'],
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

  public constructor(private readonly cdr: ChangeDetectorRef, private readonly subs: SubscriptionLifecycle) {}

  public ngAfterContentInit(): void {
    this.steps$ = queryListAndChanges$(this.steps).pipe(map(list => list.toArray()));
    this.subs.add(
      merge(
        this.selectionChange.pipe(map(({ selectedStep }) => selectedStep)),
        this.steps$.pipe(map(([firstStep]) => firstStep)),
      )
        .pipe(
          filter(step => !isNil(step.stepControl)),
          switchMap(step => step.stepControl!.statusChanges),
        )
        .subscribe(() => this.cdr.markForCheck()),
    );
  }

  public isNextDisabled(stepIndex: number): boolean {
    const currentTab = this.steps?.get(stepIndex);
    if (!currentTab) {
      return true;
    }

    const validFormStates = ['VALID', 'DISABLED'];
    const isValid = currentTab.stepControl
      ? validFormStates.includes(currentTab.stepControl.status)
      : currentTab.completed;
    const isLastStep = this.stepper ? this.isLastStep(this.stepper) : true;
    if (isLastStep) {
      return !this.areAllStepsValid();
    }

    return this.isLinear && !isValid;
  }

  /**
   * Navigate to a particular step using the index.
   *
   * In linear mode, if the user is navigating forward,
   * the steps in between should be completed.
   * @param index - index of the step to navigate to
   */
  public goToStep(index: number): void {
    if (!this.stepper) {
      return;
    }
    const isIndexValid = index >= 0 && index < this.steps.length;
    const isNavigationAllowed = this.isLinear
      ? this.areStepsInBetweenCompleted(this.stepper.selectedIndex, index)
      : true;
    if (isIndexValid && isNavigationAllowed && this.stepper) {
      this.stepper.selectedIndex = index;
    }
  }

  public next(): void {
    this.stepper?.next();
  }

  public previous(): void {
    this.stepper?.previous();
  }

  public nextOrSubmit(stepper: MatStepper): void {
    const isLastStep = this.isLastStep(stepper);
    if (isLastStep) {
      this.submitted.emit();
    } else {
      stepper.next();
    }
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

    return step.stepControl ? step.stepControl.valid || step.stepControl.disabled : step.completed;
  }

  /**
   * Check if all the steps are valid.
   * If the step has a step control , we check the forms validity and if not, we check the step completed property.
   */
  private areAllStepsValid(): boolean {
    return this.steps.toArray().every((_, index) => this.isStepCompleted(index));
  }

  private isLastStep(stepper: MatStepper): boolean {
    return stepper.selectedIndex === stepper.steps.length - 1;
  }

  /**
   * Check if all the steps in between the selected index and the index are completed.
   * Mandatory for linear stepper when navigating forward.
   */
  private areStepsInBetweenCompleted(selectedIndex: number, index: number): boolean {
    const isGoingForward = index > selectedIndex;

    return isGoingForward
      ? Array(index - selectedIndex)
          .fill(0)
          .every((_, i) => this.isStepCompleted(selectedIndex + i))
      : true;
  }
}

export enum StepperOrientation {
  Horizontal = 'horizontal',
}

export type StepperSelectionChange = StepperSelectionEvent;
