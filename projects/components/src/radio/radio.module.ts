import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { InfoIconModule } from '../info-icon/info-icon.module';
import { LabelModule } from '../label/label.module';
import { RadioGroupComponent } from './radio-group.component';

@NgModule({
  imports: [CommonModule, InfoIconModule, FormsModule, MatRadioModule, LabelModule],
  declarations: [RadioGroupComponent],
  exports: [RadioGroupComponent]
})
export class TraceRadioModule {}
