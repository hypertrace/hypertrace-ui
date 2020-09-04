import { NgModule } from '@angular/core';
import { DisplayDatePipe } from './date/display-date.pipe';
import { DisplayDurationPipe } from './duration/display-duration.pipe';
import { DisplayNumberPipe } from './numeric/display-number.pipe';
import { DisplayStringPipe } from './string/display-string.pipe';
import { DisplayTitlePipe } from './string/display-title.pipe';
import { HighlightPipe } from './string/highlight.pipe';

@NgModule({
  declarations: [
    DisplayNumberPipe,
    DisplayDatePipe,
    DisplayDurationPipe,
    DisplayStringPipe,
    HighlightPipe,
    DisplayTitlePipe
  ],
  exports: [DisplayNumberPipe, DisplayDatePipe, DisplayDurationPipe, DisplayStringPipe, HighlightPipe, DisplayTitlePipe]
})
export class FormattingModule {}
