import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MemoizeModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LoadAsyncModule } from '../load-async/load-async.module';
import { StepperComponent } from './stepper.component';
import { StepperTabControlsComponent } from './tab-controls/stepper-tab-controls.component';
import { StepperTabComponent } from './tab/stepper-tab.component';

@NgModule({
  imports: [ButtonModule, CommonModule, IconModule, LabelModule, LoadAsyncModule, MatStepperModule, MemoizeModule],
  declarations: [StepperComponent, StepperTabComponent, StepperTabControlsComponent],
  exports: [StepperComponent, StepperTabComponent, StepperTabControlsComponent]
})
export class StepperModule {}
