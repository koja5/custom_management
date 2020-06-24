import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginRouting } from './login-routing.module';
import { FormsModule } from '@angular/forms';

import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LoginComponent } from './login.component';
import { SharedModule } from 'src/app/shared.module';

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoginRouting,
    FormsModule,
    InputsModule,
    DropDownsModule,
    SharedModule
  ]
})
export class LoginModule { }
