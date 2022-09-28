import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingScreenComponent } from "./loading-screen/loading-screen.component";
import { ColumnChooserComponent } from './column-chooser/column-chooser.component';
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { InputsModule } from "@progress/kendo-angular-inputs";

@NgModule({
    declarations: [
        LoadingScreenComponent,
        ColumnChooserComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ButtonsModule,
        InputsModule
    ],
    providers: [
    ],
    exports: [LoadingScreenComponent,ColumnChooserComponent],
    bootstrap: [],
})
export class SharedComponentsModule { }
