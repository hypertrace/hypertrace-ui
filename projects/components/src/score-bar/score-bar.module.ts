import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MemoizeModule } from '@hypertrace/common';
import { TooltipModule } from '../tooltip/tooltip.module';
import { ScoreBarComponent } from './score-bar.component';


@NgModule({
  declarations: [
    ScoreBarComponent
  ],
  imports: [
    CommonModule,
    MemoizeModule,
    TooltipModule
  ],
  exports: [
    ScoreBarComponent
  ]
})
export class ScoreBarModule { }
