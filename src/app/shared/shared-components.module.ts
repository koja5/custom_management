import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { LoadingScreenComponent } from "./loading-screen/loading-screen.component";
import { ColumnChooserComponent } from "./column-chooser/column-chooser.component";
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { PaidLicenceComponent } from "../component/dashboard/licence/paid-licence/paid-licence.component";

@NgModule({
  declarations: [
    LoadingScreenComponent,
    ColumnChooserComponent,
    PaidLicenceComponent,
  ],
  imports: [CommonModule, FormsModule, ButtonsModule, InputsModule],
  providers: [],
  exports: [
    LoadingScreenComponent,
    ColumnChooserComponent,
    PaidLicenceComponent,
  ],
  bootstrap: [],
})
export class SharedComponentsModule {}
