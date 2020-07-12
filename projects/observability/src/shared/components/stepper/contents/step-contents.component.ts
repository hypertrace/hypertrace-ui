import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output
} from '@angular/core';
import { SubscriptionLifecycle } from '@hypertrace/common';
import { ButtonRole, SpinnerTheme } from '@hypertrace/components';
import { StepContentContext, StepDetail } from '../stepper';

@Component({
  selector: 'ht-step-contents',
  styleUrls: ['./step-contents.component.scss'],
  providers: [SubscriptionLifecycle],
  template: `
    <div class="ht-step-contents" *ngIf="this.currentStepDetail">
      <div class="step">
        <ng-container
          *ngTemplateOutlet="currentStepDetail.contentTemplate; context: this.buildTemplateContext(currentStepDetail)"
        ></ng-container>
      </div>
      <div class="step-navigation">
        <htc-button
          class="button back"
          traceTooltip="Back"
          label="Back"
          role="${ButtonRole.Tertiary}"
          [disabled]="!this.canGoToPrevStep()"
          (click)="this.gotoPreviousStep()"
        >
        </htc-button>
        <htc-button
          class="button next"
          traceTooltip="Next"
          label="Next"
          role="${ButtonRole.Primary}"
          *ngIf="this.showNext()"
          [disabled]="!this.canGoToNextStep()"
          (click)="this.gotoNextStep()"
        >
        </htc-button>

        <htc-button
          class="button done"
          *ngIf="this.showDone()"
          role="${ButtonRole.Primary}"
          [htcTooltip]="this.doneLabel"
          [label]="this.doneLabel"
          [disabled]="this.currentStepDetail.step.isIncomplete()"
          (click)="this.stepsCompleted.emit(true)"
        >
        </htc-button>

        <div class="summary">
          <ng-container *ngFor="let subStep of currentStepDetail.step.subSteps">
            <ng-container *htcLetAsync="subStep.status$ as status">
              <htc-spinner
                class="spinner"
                *ngIf="!status"
                [data$]="subStep.status$"
                theme="${SpinnerTheme.Dark}"
                [loadingLabel]="subStep.loadingLabel"
                [errorLabel]="subStep.errorLabel"
                [successLabel]="subStep.successLabel"
              ></htc-spinner>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepContentsComponent implements OnChanges {
  @Input()
  public stepDetails: StepDetail[] = [];

  @Input()
  public currentStepIndex: number = 0;

  @Input()
  public doneLabel!: string;

  @Output()
  public readonly stepsCompleted: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public readonly currentStepIndexChange: EventEmitter<number> = new EventEmitter();

  public currentStepDetail?: StepDetail;

  public constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly subscriptionLifecycle: SubscriptionLifecycle
  ) {}

  public ngOnChanges(): void {
    this.setCurrentStepAndSubscribe();
  }

  public canGoToPrevStep(): boolean {
    return this.currentStepIndex > 0;
  }

  public canGoToNextStep(): boolean {
    if (this.currentStepIndex < this.stepDetails.length - 1) {
      const currentStep = this.stepDetails[this.currentStepIndex].step;

      return currentStep.isReadyForCompletion() || currentStep.isCompleted();
    }

    return false;
  }

  public gotoPreviousStep(): void {
    if (this.canGoToPrevStep()) {
      this.stepDetails[this.currentStepIndex].step.markIncomplete();
      this.currentStepIndex--;
      this.setCurrentStepAndEmit();
    }
  }

  public gotoNextStep(): void {
    if (this.canGoToNextStep()) {
      this.stepDetails[this.currentStepIndex].step.markCompleted();
      this.currentStepIndex++;
      this.setCurrentStepAndEmit();
    }
  }

  public showNext(): boolean {
    return this.stepDetails.length > 0 && !this.showDone();
  }

  public showDone(): boolean {
    return this.stepDetails.length > 1 && this.currentStepIndex === this.stepDetails.length - 1;
  }

  public buildTemplateContext(currentStepDetail: StepDetail): StepContentContext {
    return {
      step: currentStepDetail.step,
      $implicit: currentStepDetail.step
    };
  }

  private setCurrentStepAndEmit(): void {
    this.setCurrentStepAndSubscribe();
    this.currentStepIndexChange.emit(this.currentStepIndex);
  }

  private setCurrentStepAndSubscribe(): void {
    if (this.currentStepIndex < this.stepDetails.length) {
      this.currentStepDetail = this.stepDetails[this.currentStepIndex];
      this.setStepChangeSubscription();
    }
  }

  private setStepChangeSubscription(): void {
    this.subscriptionLifecycle.unsubscribe();
    if (this.currentStepDetail) {
      this.subscriptionLifecycle.add(
        this.currentStepDetail.step.changes$.subscribe(() => this.changeDetector.detectChanges())
      );
    }
  }
}
