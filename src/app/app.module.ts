import { BrowserModule } from "@angular/platform-browser";
import { NgModule, LOCALE_ID } from "@angular/core";

import { CommonModule, registerLocaleData } from "@angular/common";
import localeDE from "@angular/common/locales/de";
registerLocaleData(localeDE);

import { AppRoutingModule } from "./app-routing.module";
import { HttpModule } from "@angular/http";
import { HttpClientModule, HttpClientJsonpModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { LayoutModule } from "@progress/kendo-angular-layout";

import { ToastrModule } from "ngx-toastr";

// guard
import { LoggedGuard } from "./service/login-guard/loggedGuard";
import { LoginGuard } from "./service/login-guard/loginGuard";
import { DashboardGuard } from "./service/login-guard/dashboardGuard";

//component
import { AppComponent } from "./app.component";

//service
import { MailService } from "./service/mail.service";
import { CookieService } from "ng2-cookies";
import { TaskService } from "./service/task.service";

import { MessageService } from "./service/message.service";

import "@progress/kendo-angular-intl/locales/de/all";

import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

import { NotFoundComponent } from "./component/templates/not-found/not-found.component";

import { DashboardModule } from "./component/dashboard/dashboard.module";
import { ConfirmArrivalComponent } from "./component/templates/confirm-arrival/confirm-arrival.component";
import { SharedModule } from './shared.module';
import { DymanicElementsModule } from './component/dynamic-elements/dymanic-elements.module';
import { DynamicMessageComponent } from './component/templates/dynamic-message/dynamic-message.component';
import { PatientFormSuccessComponent } from './component/templates/patient-form-success/patient-form-success.component';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ConfirmArrivalComponent,
    DynamicMessageComponent,
    PatientFormSuccessComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    DashboardModule,
    HttpModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ToastrModule.forRoot(),
    ReactiveFormsModule,
    LayoutModule,
    SharedModule,
    DymanicElementsModule
  ],
  providers: [
    MailService,
    CookieService,
    TaskService,
    LoggedGuard,
    DashboardGuard,
    LoginGuard,
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
