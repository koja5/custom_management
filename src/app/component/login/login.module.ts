import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRouting } from './login-routing.module';
import { FormsModule } from '@angular/forms';

import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LoginComponent } from './login.component';
import { SharedModule } from 'src/app/shared.module';
import { RegistrationPatientComponent } from './registration-patient/registration-patient.component';
import { CheckBoxModule, RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';

@NgModule({
  declarations: [LoginComponent, RegistrationPatientComponent],
  imports: [
    CommonModule,
    LoginRouting,
    FormsModule,
    InputsModule,
    DropDownsModule,
    SharedModule,
    RadioButtonModule,
    DatePickerModule,
    CheckBoxModule
  ]
})
export class LoginModule { }
