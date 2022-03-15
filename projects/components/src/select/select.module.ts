import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MemoizeModule } from '@hypertrace/common';
import { DividerModule } from '../divider/divider.module';
import { EventBlockerModule } from '../event-blocker/event-blocker.module';
import { IconModule } from '../icon/icon.module';
import { LabelModule } from '../label/label.module';
import { LetAsyncModule } from '../let-async/let-async.module';
import { PopoverModule } from '../popover/popover.module';
import { TraceSearchBoxModule } from '../search-box/search-box.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { SelectOptionRendererDirective } from './directive/select-option-renderer.directive';
import { SelectControlOptionComponent } from './select-control-option.component';
import { SelectGroupComponent } from './select-group.component';
import { SelectOptionComponent } from './select-option.component';
import { SelectComponent } from './select.component';

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    IconModule,
    LabelModule,
    LetAsyncModule,
    PopoverModule,
    TooltipModule,
    DividerModule,
    MemoizeModule,
    TraceSearchBoxModule,
    EventBlockerModule
  ],
  declarations: [
    SelectComponent,
    SelectOptionComponent,
    SelectGroupComponent,
    SelectControlOptionComponent,
    SelectOptionRendererDirective
  ],
  exports: [
    SelectComponent,
    SelectOptionComponent,
    SelectGroupComponent,
    SelectControlOptionComponent,
    SelectOptionRendererDirective
  ]
})
export class SelectModule {}
