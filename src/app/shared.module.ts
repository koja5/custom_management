import { NgModule } from "@angular/core";
import { ChangePasswordComponent } from './component/login/change-password/change-password.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AboutUsComponent } from "./component/templates/about-us/about-us.component";

@NgModule({
  declarations: [
    ChangePasswordComponent,
    AboutUsComponent
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
