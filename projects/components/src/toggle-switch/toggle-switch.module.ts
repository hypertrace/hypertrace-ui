import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { ToggleSwitchComponent } from './toggle-switch.component';

@NgModule({
  imports: [FormsModule, MatSlideToggleModule, CommonModule],
  declarations: [ToggleSwitchComponent],
  exports: [ToggleSwitchComponent]
})
export class ToggleSwitchModule {}
