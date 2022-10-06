import { fakeAsync } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MemoizeModule } from '@hypertrace/common';
import { createHostFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { LabelComponent } from '../label/label.component';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { StepperComponent } from '../stepper/stepper.component';
import { StepperTabComponent } from './stepper-tab.component';

describe('Stepper Component', () => {
  let spectator: Spectator<StepperComponent>;

  const createHost = createHostFactory({
    component: StepperComponent,
    declarations: [MockComponents(ButtonComponent, LabelComponent, IconComponent, StepperTabComponent)],
    imports: [MemoizeModule, MatStepperModule, LoadAsyncModule],
    shallow: true,
    detectChanges: true
  });

  test('should render stepper properly', () => {
    spectator = createHost(
      `<ht-stepper class="stepper">
          <ht-stepper-tab label="Hello"> Hello World!</ht-stepper-tab>
          <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
          <ht-stepper-tab label="Kem cho"> Test!</ht-stepper-tab>
        </ht-stepper>`
    );

    expect(spectator.query('.stepper')).toExist();
    expect(spectator.query('.action-buttons')).toExist();
    const tabLabels = spectator.queryAll(LabelComponent);
    expect(tabLabels[1].label).toBe('Yo');
    expect(spectator.query('.back-next')).toExist();
    expect(spectator.query('.cancel')).toExist();
    expect(spectator.query('.next')).toExist();
    expect(spectator.query('.back')).not.toExist();
  });

  test('should switch between tabs correctly', () => {
    spectator = createHost(
      `<ht-stepper class="stepper">
            <ht-stepper-tab label="Hello"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
            <ht-stepper-tab label="Kem cho"> Test!</ht-stepper-tab>
          </ht-stepper>`
    );

    spectator.click('.next');
    expect(spectator.query(MatStepper)?.selectedIndex).toBe(1);
    expect(spectator.query('.action-buttons')).toExist();
    expect(spectator.query('.back')).toExist();
    expect(spectator.queryAll(ButtonComponent)[2].label).toBe('Next');

    // Goto last step
    spectator.click('.next');
    expect(spectator.query(MatStepper)?.selectedIndex).toBe(2);
    expect(spectator.query('.next')).toExist();
    expect(spectator.queryAll(ButtonComponent)[2].label).toBe('Submit');

    spectator.click('.back');
    expect(spectator.query(MatStepper)?.selectedIndex).toBe(1);
  });

  describe('Next button disabled state with completed status', () => {
    test('should disable next button when the stepper is linear and first tab is not completed', () => {
      spectator = createHost(
        `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [completed]="tabOneStatus"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
          </ht-stepper>`,
        {
          hostProps: {
            isLinear: true,
            tabOneStatus: false
          }
        }
      );
      const actionButtons = spectator.queryAll(ButtonComponent);
      expect(spectator.query('.next')).toExist();
      expect(actionButtons[1].disabled).toBeTruthy();
    });

    test('should enable next button when the stepper is linear and first tab is completed', () => {
      spectator = createHost(
        `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [completed]="tabOneStatus"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
          </ht-stepper>`,
        {
          hostProps: {
            isLinear: true,
            tabOneStatus: true
          }
        }
      );
      spectator.detectComponentChanges();
      const actionButtons = spectator.queryAll(ButtonComponent);
      expect(spectator.query('.next')).toExist();
      expect(actionButtons[1].disabled).toBeFalsy();
    });
  });

  describe('Next button disabled state with form validation', () => {
    test('should disable next button when the stepper is linear and first tab form is invalid', () => {
      const formControl = new FormControl(undefined, [Validators.required]);

      spectator = createHost(
        `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [stepControl]="stepControl"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
          </ht-stepper>`,
        {
          hostProps: {
            isLinear: true,
            stepControl: formControl
          }
        }
      );
      const actionButtons = spectator.queryAll(ButtonComponent);
      expect(spectator.query('.next')).toExist();
      expect(actionButtons[1].disabled).toBeTruthy();
    });
    test('should enabled next button when the stepper is linear and first tab form is valid', fakeAsync(() => {
      const formControl = new FormControl('Hello', [Validators.required]);

      spectator = createHost(
        `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [stepControl]="stepControl"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo"> Hey!</ht-stepper-tab>
          </ht-stepper>`,
        {
          hostProps: {
            isLinear: true,
            stepControl: formControl
          }
        }
      );
      spectator.detectComponentChanges();
      const actionButtons = spectator.queryAll(ButtonComponent);
      expect(spectator.query('.next')).toExist();
      expect(actionButtons[1].disabled).toBeFalsy();
    }));
  });

  test('should disable submit button correctly on tab completed state in linear mode', () => {
    spectator = createHost(
      `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [completed]="tabOneStatus"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo" [completed]="tabTwoStatus"> Hey!</ht-stepper-tab>
            <ht-stepper-tab label="Kem cho" [completed]="tabThreeStatus" actionButtonLabel="Click me!"> Test!</ht-stepper-tab>
          </ht-stepper>`,
      {
        hostProps: {
          isLinear: true,
          tabOneStatus: true,
          tabTwoStatus: true,
          tabThreeStatus: false
        }
      }
    );

    // Goto last step
    spectator.click('.next');
    spectator.click('.next');

    const actionButtons = spectator.queryAll(ButtonComponent);
    const submitButton = actionButtons[2]; // <-- ["Cancel", "Back", "Submit"]
    expect(submitButton.label).toBe('Click me!');
    expect(submitButton.disabled).toBeTruthy();
  });
});
