import { ConfirmArrivalComponent } from "./component/templates/confirm-arrival/confirm-arrival.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import { LoginGuard } from "./service/login-guard/loginGuard";
import { LoggedGuard } from "./service/login-guard/loggedGuard";
import { DashboardGuard } from "./service/login-guard/dashboardGuard";

//components
import { LoginComponent } from "./component/login/login.component";
import { ChangePasswordComponent } from "./component/login/change-password/change-password.component";
import { DashboardComponent } from "./component/dashboard/dashboard.component";
import { TaskComponent } from "./component/dashboard/task/task.component";
import { UsersComponent } from "./component/dashboard/users/users.component";
import { StoreComponent } from "./component/dashboard/store/store.component";
import { ProfileComponent } from "./component/dashboard/profile/profile.component";
import { CustomersComponent } from "./component/dashboard/customers/customers.component";
import { BaseDateComponent } from "./component/dashboard/task/base-date/base-date.component";
import { DocumentPreviewComponent } from "./component/dashboard/document-preview/document-preview.component";
import { UserDetailsComponent } from "./component/dashboard/users/user-details/user-details.component";
import { ParametersComponent } from "./component/dashboard/parameters/parameters.component";
import { StatisticComponent } from "./component/dashboard/statistic/statistic.component";
import { VaucherComponent } from "./component/dashboard/vaucher/vaucher.component";
import { SettingsComponent } from "./component/dashboard/settings/settings.component";
import { EventCategoryComponent } from "./component/dashboard/parameters/event-category/event-category.component";
import { WorkTimeColorsComponent } from "./component/dashboard/parameters/work-time-colors/work-time-colors.component";
import { NotFoundComponent } from "./component/templates/not-found/not-found.component";
import { TranslationComponent } from "./component/dashboard/translation/translation.component";
import { EditTranslationComponent } from "./component/dashboard/translation/edit-translation/edit-translation.component";

const routes: Routes = [
  { path: "", redirectTo: "", pathMatch: "full" },
  { path: "login", component: LoginComponent, canActivate: [LoggedGuard] },
  {
    path: "changePassword/:id",
    component: ChangePasswordComponent,
    canActivate: [LoggedGuard],
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [LoginGuard, DashboardGuard],
    children: [
      { path: "task", component: TaskComponent, outlet: "dashboard" },
      { path: "users", component: UsersComponent, outlet: "dashboard" },
      {
        path: "user-details/:id",
        component: UserDetailsComponent,
        outlet: "dashboard",
      },
      { path: "store", component: StoreComponent, outlet: "dashboard" },
      { path: "profile", component: ProfileComponent, outlet: "dashboard" },
      { path: "customers", component: CustomersComponent, outlet: "dashboard" },
      {
        path: "parameters",
        component: ParametersComponent,
        outlet: "dashboard",
      },
      { path: "statistic", component: StatisticComponent, outlet: "dashboard" },
      { path: "vaucher", component: VaucherComponent, outlet: "dashboard" },
      {
        path: "settings",
        component: SettingsComponent,
        outlet: "dashboard",
        children: [
          {
            path: "change-password",
            component: ChangePasswordComponent,
            outlet: "settings",
          },
        ],
      },
      {
        path: "complaint",
        component: ParametersComponent,
        outlet: "dashboard",
      },
      { path: "therapy", component: ParametersComponent, outlet: "dashboard" },
      {
        path: "treatment",
        component: ParametersComponent,
        outlet: "dashboard",
      },
      {
        path: "recommendation",
        component: ParametersComponent,
        outlet: "dashboard",
      },
      {
        path: "relationship",
        component: ParametersComponent,
        outlet: "dashboard",
      },
      { path: "social", component: ParametersComponent, outlet: "dashboard" },
      { path: "doctor", component: ParametersComponent, outlet: "dashboard" },
      { path: "doctors", component: ParametersComponent, outlet: "dashboard" },
      { path: "vat_tax", component: ParametersComponent, outlet: "dashboard" },
      { path: "CS", component: ParametersComponent, outlet: "dashboard" },
      { path: "state", component: ParametersComponent, outlet: "dashboard" },
      {
        path: "event-category",
        component: EventCategoryComponent,
        outlet: "dashboard",
      },
      {
        path: "work-time-colors",
        component: WorkTimeColorsComponent,
        outlet: "dashboard",
      },
      {
        path: "translation",
        component: TranslationComponent,
        outlet: "dashboard",
      },
      {
        path: "translation/edit/:id",
        component: EditTranslationComponent,
        outlet: "dashboard",
      },
    ],
  },
  {
    path: "document/server/routes/uploads/:id",
    component: DocumentPreviewComponent,
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
export const routingComponents = [AppComponent, LoginComponent];
