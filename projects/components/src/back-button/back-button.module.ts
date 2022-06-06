import { NgModule } from "@angular/core";
import { IconModule } from "../icon/icon.module";
import { LabelModule } from "../label/label.module";
import { BackButtonComponent } from "./back-button.component";

@NgModule({
  imports: [IconModule, LabelModule],
  declarations: [BackButtonComponent],
  exports: [BackButtonComponent]
})
export class BackButtonModule {}
