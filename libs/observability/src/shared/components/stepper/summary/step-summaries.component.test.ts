import { RouterTestingModule } from '@angular/router/testing';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { Step } from '../step';
import { StepSummariesComponent } from './step-summaries.component';
import { StepSummariesModule } from './step-summaries.module';

describe('Step Summaries component', () => {
  let spectator: Spectator<StepSummariesComponent>;

  const createHost = createHostFactory({
    declareComponent: false,
    component: StepSummariesComponent,
    imports: [StepSummariesModule, RouterTestingModule],
    providers: []
  });

  test('summaries should be rendered', () => {
    const steps = [new Step(), new Step()];
    spectator = createHost(`<ht-step-summaries [steps]="steps"></ht-step-summaries>`, {
      hostProps: {
        steps: steps
      }
    });

    expect(spectator.queryAll('.summary').length).toEqual(2);
    expect(spectator.queryAll('.footer')).not.toExist();
    expect(spectator.queryAll('.summary-title')).not.toExist();
  });

  test('footer should be rendered if provided', () => {
    spectator = createHost(
      `<ht-step-summaries>
        <div *htStepSummaryFooter>
          <div class="help-section">Footer</div>
        </div>
      </ht-step-summaries>`
    );

    expect(spectator.queryAll('.help-section')).toExist();
  });

  test('title should be rendered if provided', () => {
    spectator = createHost(
      `<ht-step-summaries>
        <div *htStepSummaryHeader>
        My Title
        </div>
      </ht-step-summaries>`
    );

    expect(spectator.query('.summary-header')).toHaveText('My Title');
  });
});
