import { SettingsRoutingModule } from './settings-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account/account.component';
import { DymanicElementsModule } from '../../dynamic-elements/dymanic-elements.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PermissionPatientMenuComponent } from './permission-patient-menu/permission-patient-menu.component';
import { RemindersComponent } from './reminders/reminders.component';
import { LanguageComponent } from './language/language.component';
import { SettingsComponent } from './settings.component';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { MessageService } from 'src/app/service/message.service';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    DymanicElementsModule,
    DropDownListModule
  ],
  declarations: [SettingsComponent, AccountComponent, ChangePasswordComponent, RemindersComponent, LanguageComponent]
})
export class SettingsModule { }