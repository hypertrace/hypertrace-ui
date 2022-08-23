import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MemoizeModule } from '@hypertrace/common';
import { ButtonModule } from '../button/button.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LoadAsyncModule } from '../public-api';
import { StepperTabComponent } from './stepper-tab.component';
import { StepperComponent } from './stepper.component';

@NgModule({
  imports: [ButtonModule, CommonModule, IconModule, LabelModule, LoadAsyncModule, MatStepperModule, MemoizeModule],
  declarations: [StepperComponent, StepperTabComponent],
  exports: [StepperComponent, StepperTabComponent]
})
export class StepperModule {}
