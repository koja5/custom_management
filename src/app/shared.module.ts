import { NgModule } from "@angular/core";
import { ChangePasswordComponent } from './component/login/change-password/change-password.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    FormsModule
  ],
  providers: [
  ],
  exports: [ChangePasswordComponent],
  bootstrap: [],
})
export class SharedModule {}
