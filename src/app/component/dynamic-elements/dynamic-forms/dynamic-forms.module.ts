import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFieldsDirective } from './dynamic-fields/dynamic-fields.directive';
import { DropdownComponent } from "./dynamic-fields/dropdown/dropdown.component";
import { TextboxComponent } from './dynamic-fields/textbox/textbox.component';
import { TextareaComponent } from './dynamic-fields/textarea/textarea.component';
import { NumericComponent } from './dynamic-fields/numeric/numeric.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormsComponent } from './dynamic-forms.component';
import {NumericTextBoxModule, TextBoxModule} from '@syncfusion/ej2-angular-inputs';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { DatepickerComponent } from './dynamic-fields/datepicker/datepicker.component';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import { ButtonComponent } from './dynamic-fields/button/button.component';
import { CheckBoxModule, RadioButtonModule, SwitchModule } from '@syncfusion/ej2-angular-buttons';
import { RadioComponent } from './dynamic-fields/radio/radio.component';
import { CheckboxComponent } from './dynamic-fields/checkbox/checkbox.component';
import { SwitchComponent } from './dynamic-fields/switch/switch.component';
import { MultiselectComponent } from './dynamic-fields/multiselect/multiselect.component';
import { MultiSelectModule } from '@progress/kendo-angular-dropdowns';
import { MatFormFieldModule, MatInputModule } from "@angular/material";

@NgModule({
  declarations: [DynamicFieldsDirective, DropdownComponent, TextboxComponent, TextareaComponent, NumericComponent, DatepickerComponent, ButtonComponent, RadioComponent, CheckboxComponent, SwitchComponent, MultiselectComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TextBoxModule, DropDownListModule,
    MultiSelectModule,
    FormsModule,
    DatePickerModule,
    NumericTextBoxModule,
    RadioButtonModule,
    CheckBoxModule,
    SwitchModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  exports: [DynamicFieldsDirective],
  entryComponents: [TextboxComponent, DropdownComponent, TextareaComponent, NumericComponent, DatepickerComponent, ButtonComponent, RadioComponent, CheckboxComponent, SwitchComponent, MultiselectComponent],
})
export class DynamicFormsModule { }
