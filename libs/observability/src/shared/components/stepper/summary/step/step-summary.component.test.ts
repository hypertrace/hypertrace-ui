import { CommonModule } from '@angular/common';
import { fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IconModule, SpinnerModule } from '@hypertrace/components';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { Step } from '../../step';
import { StepSummaryComponent } from './step-summary.component';

describe('Step Summary component', () => {
  let spectator: Spectator<StepSummaryComponent>;

  const createHost = createHostFactory({
    declareComponent: true,
    component: StepSummaryComponent,
    imports: [CommonModule, IconModule, RouterTestingModule, SpinnerModule],
    providers: []
  });

  test('summary details should be rendered', fakeAsync(() => {
    const step = new Step();
    const position = 1;

    spectator = createHost(`<ht-step-summary [step]="step" [position]="position"></ht-step-summary>`, {
      hostProps: {
        step: step,
        position: position
      }
    });

    spectator.tick();

    expect(spectator.query('.status')).toEqual(spectator.query('.in-progress'));
    expect(spectator.query('.status')).not.toEqual(spectator.query('.done'));
    expect(spectator.query('.title')).toHaveExactText('Step 1');
    expect(spectator.query('.name')).toHaveExactText('');

    step.markCompleted();
    spectator.tick();

    expect(spectator.query('.status')).toEqual(spectator.query('.done'));
    expect(spectator.query('.status')).not.toEqual(spectator.query('.in-progress'));

    step.name = 'Setup';
    spectator.tick();

    expect(spectator.query('.name')).toHaveExactText('Setup');
  }));
});
