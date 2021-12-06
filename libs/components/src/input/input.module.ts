import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { InputComponent } from './input.component';

@NgModule({
  imports: [CommonModule, FormsModule, MatInputModule],
  declarations: [InputComponent],
  exports: [InputComponent]
})
export class InputModule {}
