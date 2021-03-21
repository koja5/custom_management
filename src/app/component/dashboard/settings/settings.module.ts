import { SettingsRoutingModule } from './settings-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account/account.component';
import { DymanicElementsModule } from '../../dynamic-elements/dymanic-elements.module';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { PermissionPatientMenuComponent } from './permission-patient-menu/permission-patient-menu.component';

@NgModule({
  imports: [
    CommonModule,
    SettingsRoutingModule,
    DymanicElementsModule
  ],
  declarations: [AccountComponent, ChangePasswordComponent, PermissionPatientMenuComponent],
  exports: [ AccountComponent, ChangePasswordComponent ]
})
export class SettingsModule { }