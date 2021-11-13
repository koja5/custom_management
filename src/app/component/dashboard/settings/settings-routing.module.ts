import { SettingsComponent } from "./settings.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AccountComponent } from "./account/account.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { PermissionPatientMenuComponent } from "./permission-patient-menu/permission-patient-menu.component";
import { LanguageComponent } from "./language/language.component";

const routes: Routes = [
  { path: "", redirectTo: "account", pathMatch: "full" },
  { path: "account", component: AccountComponent },
  {
    path: "change-password",
    component: ChangePasswordComponent,
  },
  {
    path: "change-language",
    component: LanguageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
