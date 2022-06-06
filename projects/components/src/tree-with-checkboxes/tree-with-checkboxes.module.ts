import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeWithCheckboxesComponent } from './tree-with-checkboxes.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { IconModule } from '../icon/icon.module';
import { TraceCheckboxModule } from '../checkbox/checkbox.module';
import { ButtonModule } from '../button/button.module';
import { InputModule } from '../input/input.module';
import { LabelModule } from '../label/label.module';

@NgModule({
  declarations: [TreeWithCheckboxesComponent],
  exports: [TreeWithCheckboxesComponent],
  imports: [
    CommonModule,
    MatTreeModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    IconModule,
    TraceCheckboxModule,
    ButtonModule,
    InputModule,
    LabelModule
  ]
})
export class TreeWithCheckboxesModule {}
