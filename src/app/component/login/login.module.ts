import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginRouting } from "./login-routing.module";
import { LoginComponent } from "./login.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [LoginComponent, ChangePasswordComponent],
  imports: [CommonModule, LoginRouting, FormsModule],
})
export class LoginModule {}
