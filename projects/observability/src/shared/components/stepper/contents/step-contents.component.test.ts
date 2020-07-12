import { CommonModule } from '@angular/common';
import { Component, EventEmitter, ViewChild } from '@angular/core';
import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ButtonModule, LetAsyncModule, SpinnerModule, TooltipModule } from '@hypertrace/components';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { StepContentDirective } from '../directive/content/step-content.directive';
import { Step } from '../step';
import { StepDetail } from '../stepper';
import { StepContentsComponent } from './step-contents.component';

describe('Step Contents component', () => {
  @Component({
    selector: 'ht-dynamic-component',
    template: `
      <ht-step-contents
        [stepDetails]="stepDetails"
        (currentStepIndexChange)="this.onStepIndexChange($event)"
      ></ht-step-contents>
      <div *htStepContent class="projected-step-content">TestContent</div>
    `
  })
  class TestHostComponent {
    @ViewChild(StepContentDirective, { static: true })
    public content!: StepContentDirective;

    public stepDetails: StepDetail[] = [];
    public readonly stepIndexChange: EventEmitter<number> = new EventEmitter();
    public onStepIndexChange: jest.Mock = jest.fn();
  }

  let spectator: Spectator<TestHostComponent>;

  const createComponent = createComponentFactory({
    component: TestHostComponent,
    declarations: [StepContentsComponent, TestHostComponent, StepContentDirective],
    imports: [ButtonModule, RouterTestingModule, CommonModule, SpinnerModule, LetAsyncModule, TooltipModule],
    declareComponent: false
  });

  test('check if step is rendered', fakeAsync(() => {
    spectator = createComponent();
    const stepDetails: StepDetail[] = [
      {
        step: new Step(),
        contentTemplate: spectator.component.content.templateRef
      },
      {
        step: new Step(),
        contentTemplate: spectator.component.content.templateRef
      }
    ];

    spectator.component.stepDetails = stepDetails;
    spectator.detectChanges();

    expect(spectator.query('.projected-step-content')).toExist();
    expect(spectator.query('.projected-step-content')).toHaveText('TestContent');

    expect(spectator.query('.back')).toExist();
    expect(spectator.query('.next')).toExist();

    // Mark first step ready for completion
    stepDetails[0].step.markReadyForCompletion();
    spectator.tick();

    // Click on Next
    spectator.click(spectator.query('.next')!);
    spectator.tick();
    expect(spectator.component.onStepIndexChange).toHaveBeenLastCalledWith(1);

    // Click on back
    spectator.click(spectator.query('.back')!);
    spectator.tick();
    expect(spectator.component.onStepIndexChange).toHaveBeenLastCalledWith(0);
  }));
});
