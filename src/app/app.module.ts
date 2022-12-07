import { BrowserModule } from "@angular/platform-browser";
import { NgModule, APP_INITIALIZER } from "@angular/core";

import { CommonModule, registerLocaleData } from "@angular/common";
import localeDE from "@angular/common/locales/de";
registerLocaleData(localeDE);

import { AppRoutingModule } from "./app-routing.module";
import { HttpModule } from "@angular/http";
import {
  HttpClientModule,
  HttpClientJsonpModule,
} from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { LayoutModule } from "@progress/kendo-angular-layout";

import { ToastrModule } from "ngx-toastr";

// guard
import { LoggedGuard } from "./service/guards/loggedGuard";
import { LoginGuard } from "./service/guards/loginGuard";
import { DashboardGuard } from "./service/guards/dashboardGuard";

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
import { SharedModule } from "./shared.module";
import { DymanicElementsModule } from "./component/dynamic-elements/dymanic-elements.module";
import { DynamicMessageComponent } from "./component/templates/dynamic-message/dynamic-message.component";
import { PatientFormSuccessComponent } from "./component/templates/patient-form-success/patient-form-success.component";
import { PrivacyPolicyComponent } from "./component/templates/privacy-policy/privacy-policy.component";
import { TermsComponent } from "./component/templates/terms/terms.component";
import { ImpressumComponent } from "./component/templates/impressum/impressum.component";
import { SharedComponentsModule } from "./shared/shared-components.module";
import { RouterModule } from "@angular/router";
import { FormGuard } from "./service/form-guard/formGuard";
import { NgxStripeModule } from "ngx-stripe";
import { AccessForbiddenComponent } from './component/templates/access-forbidden/access-forbidden.component';

import { RightOfWithdrawalComponent } from './component/templates/right-of-withdrawal/right-of-withdrawal.component';

import { VersionInfoService } from "./shared/version-info/version-info.service";
import { VersionCheckService } from "./shared/version-check/version-check.service";

export const setupVersionCheckerFactory=(
  versionInfoService: VersionInfoService,
  versionCheckService: VersionCheckService): ()=> void => () => {

    versionInfoService.setLanguageVersion().then(()=>{
        versionCheckService.initializeVersionChecker();
    });
  }

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    ConfirmArrivalComponent,
    DynamicMessageComponent,
    PatientFormSuccessComponent,
    PrivacyPolicyComponent,
    TermsComponent,
    ImpressumComponent,
    AccessForbiddenComponent,
    RightOfWithdrawalComponent
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
    DymanicElementsModule,
    SharedComponentsModule,
    RouterModule,
    NgxStripeModule.forRoot('pk_test_51LhYhHL4uVudLiXA5WwSojoMtx6m0rOM7fufOkPllausovqA0BhBJ0Id0ROuRb336IVLZMjshamhIIOlT1hFOAAS00zH00KnIN')
  ],
  providers: [
    MailService,
    CookieService,
    TaskService,
    LoggedGuard,
    FormGuard,
    DashboardGuard,
    LoginGuard,
    MessageService,
    {
      provide: APP_INITIALIZER,
      useFactory: setupVersionCheckerFactory,
      deps:[VersionInfoService,VersionCheckService],
      multi:true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
