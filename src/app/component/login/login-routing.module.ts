import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginComponent } from "./login.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { LoggedGuard } from 'src/app/service/guards/loggedGuard';
import { RegistrationPatientComponent } from "./registration-patient/registration-patient.component";

const routes: Routes = [
  {
    path: "",
    component: LoginComponent
  },
  {
    path: "changePassword/:id",
    component: ChangePasswordComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: "registration/:clinic",
    component: RegistrationPatientComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRouting { }
