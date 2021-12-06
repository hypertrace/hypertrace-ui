import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { StepperComponent } from './stepper.component';
import { StepperModule } from './stepper.module';

describe('Stepper component', () => {
  let spectator: Spectator<StepperComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: StepperComponent,
    imports: [StepperModule, RouterTestingModule],
    providers: []
  });

  test('check if trace step is created', fakeAsync(() => {
    spectator = createHost(`
      <ht-stepper>
        <div class="first-step" *htStepContent="let step; name: 'Setup'" (click)="step.markCompleted()">Content 1</div>
      </ht-stepper>
    `);

    spectator.tick();

    expect(spectator.query('.ht-stepper')).toExist();
    expect(spectator.query('.step-summaries')).toExist();
    expect(spectator.query('.step-content')).toExist();
    expect(spectator.component.stepDetails.length).toBe(1);
    expect(spectator.component.stepDetails.length).toBe(1);
    expect(spectator.component.steps.length).toBe(1);

    const stepElement = spectator.query('.first-step');
    expect(stepElement).toExist();
    expect(stepElement).toHaveText('Content 1');
    expect(spectator.component.steps[0].name).toBe('Setup');

    expect(spectator.component.steps[0].isCompleted()).toBeFalsy();

    spectator.click(stepElement!);
    spectator.tick();

    expect(spectator.component.steps[0].isCompleted()).toBeTruthy();
  }));

  test('check if footer is rendered if provided', fakeAsync(() => {
    spectator = createHost(`
      <ht-stepper>
        <div *htStepSummaryFooterSection>
          <div class="test-footer"></div>
        </div>
      </ht-stepper>
    `);

    spectator.tick();

    expect(spectator.query('.step-summaries .footer')).toExist();
  }));

  test('check if header is rendered if provided', fakeAsync(() => {
    spectator = createHost(`
      <ht-stepper>
        <div *htStepSummaryHeaderSection>
          <div class="test-header"></div>
        </div>
      </ht-stepper>
    `);

    spectator.tick();

    expect(spectator.query('.step-summaries .test-header')).toExist();
  }));
});
