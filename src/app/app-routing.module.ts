import { ConfirmArrivalComponent } from "./component/templates/confirm-arrival/confirm-arrival.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginGuard } from "./service/login-guard/loginGuard";
import { LoggedGuard } from "./service/login-guard/loggedGuard";
import { DashboardGuard } from "./service/login-guard/dashboardGuard";

import { NotFoundComponent } from "./component/templates/not-found/not-found.component";

const routes: Routes = [
  { path: "", redirectTo: "", pathMatch: "full" },
  {
    path: "login",
    canActivate: [LoggedGuard],
    loadChildren: "./component/login/login.module#LoginModule",
  },
  {
    path: "dashboard",
    canActivate: [LoginGuard],
    loadChildren: "./component/dashboard/dashboard.module#DashboardModule",
  },
  { path: "template/confirm-arrival", component: ConfirmArrivalComponent },
  {
    path: "**",
    pathMatch: "full",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
