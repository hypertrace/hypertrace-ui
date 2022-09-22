import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
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
    declarations: [MockComponents(ButtonComponent, LabelComponent, IconComponent), StepperTabComponent],
    imports: [MemoizeModule, MatStepperModule, LoadAsyncModule],
    shallow: true
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

    spectator.click('.next');
    expect(spectator.query(MatStepper)?.selectedIndex).toBe(2);
    expect(spectator.query('.submit')).toExist();
    expect(spectator.query('.next')).not.toExist();

    spectator.click('.back');
    expect(spectator.query(MatStepper)?.selectedIndex).toBe(1);
  });

  test('should disable next button correctly on tab completed state', () => {
    spectator = createHost(
      `<ht-stepper class="stepper" [isLinear]="isLinear">
            <ht-stepper-tab label="Hello" [completed]="tabOneStatus"> Hello World!</ht-stepper-tab>
            <ht-stepper-tab label="Yo" [completed]="tabTwoStatus"> Hey!</ht-stepper-tab>
            <ht-stepper-tab label="Kem cho" [completed]="tabThreeStatus"> Test!</ht-stepper-tab>
          </ht-stepper>`,
      {
        hostProps: {
          isLinear: true,
          tabOneStatus: false,
          tabTwoStatus: false,
          tabThreeStatus: false
        }
      }
    );

    const actionButtons = spectator.queryAll(ButtonComponent);
    expect(spectator.query('.next')).toExist();
    expect(actionButtons[1].disabled).toBe(true);
  });

  test('should disable submit button correctly on tab completed state', () => {
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

    spectator.click('.next');
    spectator.click('.next');
    const actionButtons = spectator.queryAll(ButtonComponent);
    expect(spectator.query('.submit')).toExist();
    expect(spectator.debugElement.query(By.css('.submit')).componentInstance.label).toBe('Click me!');
    expect(actionButtons[2].disabled).toBe(true);
  });
});
