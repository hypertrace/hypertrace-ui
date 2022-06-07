import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTreeModule } from '@angular/material/tree';
import { ButtonModule } from '../button/button.module';
import { TraceCheckboxModule } from '../checkbox/checkbox.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { TreeWithCheckboxesComponent } from './tree-with-checkboxes.component';

@NgModule({
  declarations: [TreeWithCheckboxesComponent],
  exports: [TreeWithCheckboxesComponent],
  imports: [CommonModule, MatTreeModule, MatFormFieldModule, IconModule, TraceCheckboxModule, ButtonModule, LabelModule]
})
export class TreeWithCheckboxesModule {}
