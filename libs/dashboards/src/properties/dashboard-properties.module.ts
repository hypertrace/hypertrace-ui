import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { InputModule, LabelModule, SelectModule } from '@hypertrace/components';
import { DashboardCoreModule } from '@hypertrace/hyperdash-angular';
import { ENUM_TYPE } from './enums/enum-property-type';
import { EnumPropertyTypeEditorComponent } from './enums/enum-property-type-editor.component';
import { StringPropertyEditorComponent } from './primitives/string-property-editor.component';
@NgModule({
  declarations: [StringPropertyEditorComponent, EnumPropertyTypeEditorComponent],
  imports: [
    CommonModule,
    InputModule,
    LabelModule,
    SelectModule,
    DashboardCoreModule.with({
      propertyTypes: [ENUM_TYPE],
      editors: [StringPropertyEditorComponent, EnumPropertyTypeEditorComponent]
    })
  ]
})
export class DashboardPropertyEditorsModule {}
