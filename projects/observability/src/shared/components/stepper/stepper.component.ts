import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList
} from '@angular/core';
import { queryListAndChanges$ } from '@hypertrace/common';
import { map } from 'rxjs/operators';
import { StepContentDirective } from './directive/content/step-content.directive';
import { StepSummaryFooterSectionDirective } from './directive/footer/step-summary-footer-section.directive';
import { StepSummaryHeaderSectionDirective } from './directive/footer/step-summary-header-section.directive';
import { Step } from './step';
import { StepDetail } from './stepper';

@Component({
  selector: 'ht-stepper',
  template: `
    <div class="ht-stepper">
      <ht-step-summaries class="step-summaries" [steps]="this.steps">
        <ng-container *ngIf="this.stepHeader">
          <div *htStepSummaryHeader>
            <ng-container *ngTemplateOutlet="this.stepHeader!.getTemplateRef()"></ng-container>
          </div>
        </ng-container>
        <!-- Project the footer content into the step summaries component -->
        <ng-container *ngIf="this.stepFooter">
          <div *htStepSummaryFooter>
            <ng-container *ngTemplateOutlet="this.stepFooter!.getTemplateRef()"></ng-container>
          </div>
        </ng-container>
      </ht-step-summaries>
      <ht-step-contents
        class="step-content"
        [stepDetails]="this.stepDetails"
        [doneLabel]="this.doneLabel"
        (currentStepIndexChange)="this.currentStepIndexChange.emit($event)"
        (stepsCompleted)="this.stepsCompleted.emit($event)"
      ></ht-step-contents>
    </div>
  `,
  styleUrls: ['./stepper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent implements AfterContentInit {
  @Input()
  public doneLabel!: string;

  @Output()
  public readonly stepsCompleted: EventEmitter<boolean> = new EventEmitter();

  @Output()
  public readonly currentStepIndexChange: EventEmitter<number> = new EventEmitter();

  @ContentChildren(StepContentDirective)
  private readonly stepContents!: QueryList<StepContentDirective>;

  @ContentChild(StepSummaryFooterSectionDirective)
  public readonly stepFooter?: StepSummaryFooterSectionDirective;

  @ContentChild(StepSummaryHeaderSectionDirective)
  public readonly stepHeader?: StepSummaryHeaderSectionDirective;

  public stepDetails: StepDetail[] = [];
  public steps: Step[] = [];

  public ngAfterContentInit(): void {
    queryListAndChanges$(this.stepContents)
      .pipe(map(list => this.buildStepDetails(list)))
      .subscribe(stepDetails => {
        this.stepDetails = stepDetails;
        this.steps = this.stepDetails.map(stepDetail => stepDetail.step);
      });
  }

  private buildStepDetails(stepContentList: QueryList<StepContentDirective>): StepDetail[] {
    return stepContentList.toArray().map(stepContent => ({
      step: stepContent.step,
      contentTemplate: stepContent.templateRef
    }));
  }
}
