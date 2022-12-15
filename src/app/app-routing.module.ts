import { MassiveUnsubscribeComponent } from "./component/dashboard/marketing/massive-unsubscribe/massive-unsubscribe.component";
import { ConfirmArrivalComponent } from "./component/templates/confirm-arrival/confirm-arrival.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LoginGuard } from "./service/guards/loginGuard";
import { LoggedGuard } from "./service/guards/loggedGuard";

import { NotFoundComponent } from "./component/templates/not-found/not-found.component";
import { PatientFormSuccessComponent } from "./component/templates/patient-form-success/patient-form-success.component";
import { ImpressumComponent } from "./component/templates/impressum/impressum.component";
import { PrivacyPolicyComponent } from "./component/templates/privacy-policy/privacy-policy.component";
import { TermsComponent } from "./component/templates/terms/terms.component";
import { UnsubscribeGuard } from "./service/guards/unsubscribe.guard";
import { AccessForbiddenComponent } from "./component/templates/access-forbidden/access-forbidden.component";
import { LicenceComponent } from "./component/dashboard/licence/licence.component";
import { RightOfWithdrawalComponent } from "./component/templates/right-of-withdrawal/right-of-withdrawal.component";

const routes: Routes = [
  {
    path: "",
    loadChildren: "./component/home/routing-module/home.module#HomedModule",
  },
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
    path: "template/created-account-successed",
    component: PatientFormSuccessComponent,
  },
  {
    path: "impressum",
    component: ImpressumComponent,
  },
  {
    path: "privacy-policy",
    component: PrivacyPolicyComponent,
  },
  {
    path: "terms",
    component: TermsComponent,
  },
  {
    path: "right-of-withdrawal",
    component: RightOfWithdrawalComponent,
  },
  {
    path: "unsubscribeSMS/:customerId",
    canActivate: [UnsubscribeGuard],
    component: MassiveUnsubscribeComponent,
  },
  {
    path: "unsubscribeEmail/:customerId",
    canActivate: [UnsubscribeGuard],
    component: MassiveUnsubscribeComponent,
  },
  {
    path: "access-forbiden",
    component: AccessForbiddenComponent,
  },
  {
    path: "licence",
    component: LicenceComponent,
  },
  {
    path: "licence",
    component: LicenceComponent
  },
  {
    path: "**",
    pathMatch: "full",
    component: NotFoundComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled", // Add options right here
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
