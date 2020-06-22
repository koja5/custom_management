import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { LoggedGuard } from 'src/app/service/login-guard/loggedGuard';

const routes: Routes = [
  {
    path: "",
    component: LoginComponent
  },
  {
    path: "changePassword/:id",
    component: ChangePasswordComponent,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRouting {}
