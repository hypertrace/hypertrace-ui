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
    <div class="stepper" *ngIf="this.steps$ | async as steps">
      <mat-stepper [orientation]="this.orientation" [linear]="this.isLinear" #stepper>
        <ng-container *ngFor="let step of steps; index as i">
          <mat-step [completed]="step.completed" [stepControl]="step.stepControl" [optional]="step.optional">
            <ng-template matStepLabel>
              <ht-label class="header-label" [label]="step.label"></ht-label>
            </ng-template>
            <ng-container *ngTemplateOutlet="step.content"></ng-container>
            <ng-template matStepperIcon="edit">
              <ht-icon [icon]="step.icon" [size]="'${IconSize.ExtraSmall}'"> </ht-icon>
            </ng-template>
          </mat-step>
        </ng-container>
      </mat-stepper>
      <div class="action-buttons">
        <ht-button label="Cancel" (click)="onClickCancel()" [role]="'${ButtonRole.Tertiary}'"></ht-button>
        <div class="back-next">
          <ht-button
            *ngIf="stepper.selectedIndex !== 0"
            [display]="'${ButtonStyle.Outlined}'"
            label="Back"
            (click)="onClickBack(stepper)"
          ></ht-button>
          <ht-button
            *ngIf="stepper.selectedIndex !== steps.length - 1"
            label="Next"
            (click)="onClickNext(stepper)"
            [disabled]="
              this.isNextDisabled
                | htMemoize
                  : this.isLinear
                  : stepper.steps.get(stepper.selectedIndex)?.completed
                  : stepper.steps.get(stepper.selectedIndex)?.stepControl?.valid
            "
          ></ht-button>
          <ht-button
            *ngIf="stepper.selectedIndex === steps.length - 1"
            label="Submit"
            (click)="onClickSubmit()"
            [disabled]="
              this.isSubmitDisabled
                | htMemoize
                  : stepper.steps.get(stepper.selectedIndex)?.completed
                  : stepper.steps.get(stepper.selectedIndex)?.stepControl?.valid
            "
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

  @Input()
  public isLinear: boolean = false;

  @Input()
  public orientation: StepperOrientation = StepperOrientation.Horizontal;

  @Input()
  public enableSubmit?: boolean;

  @Output()
  public readonly submitForm: EventEmitter<boolean> = new EventEmitter();

  public steps$?: Observable<StepperTabComponent[]>;

  public ngAfterContentInit(): void {
    this.steps$ = queryListAndChanges$(this.steps).pipe(map(list => list.toArray()));
  }

  public onClickNext(stepper: MatStepper): void {
    stepper.next();
  }

  public onClickBack(stepper: MatStepper): void {
    stepper.previous();
  }

  public onClickSubmit(): void {
    this.submitForm.emit(true);
  }

  public onClickCancel(): void {
    this.submitForm.emit(false);
  }

  public isNextDisabled(
    isLinear: boolean,
    stepCompleted: boolean | undefined,
    formValid: boolean | undefined
  ): boolean {
    return isLinear && !stepCompleted && !formValid;
  }

  public isSubmitDisabled(stepCompleted: boolean | undefined, formValid: boolean | undefined): boolean {
    return !stepCompleted && !formValid;
  }
}

export enum StepperOrientation {
  Horizontal = 'horizontal'
}
