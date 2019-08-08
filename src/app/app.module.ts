import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';

import { registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/de';
registerLocaleData(localeDE);

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SchedulerModule } from '@progress/kendo-angular-scheduler';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { GridModule, ExcelModule, PDFModule } from '@progress/kendo-angular-grid';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ModalModule } from 'ngx-modal';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LayoutModule, SplitterModule } from '@progress/kendo-angular-layout';
import { IntlModule } from '@progress/kendo-angular-intl';
import { ColorPickerModule } from '@progress/kendo-angular-inputs';
import { UploadModule } from '@progress/kendo-angular-upload';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FileSelectDirective, FileDropDirective, FileUploadModule } from 'ng2-file-upload';

// guard
import { LoggedGuard } from './service/login-guard/loggedGuard';
import { LoginGuard } from './service/login-guard/loginGuard';
import { DashboardGuard } from './service/login-guard/dashboardGuard';

//component
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { TaskComponent } from './component/dashboard/task/task.component';
import { MyNavigationComponent } from './component/dashboard/task/my-navigation';
import { MyNavigationViewComponent } from './component/dashboard/task/my-navigation-view';

//service
import { LoginService } from './service/login.service';
import { MailService } from './service/mail.service';
import { CookieService } from 'ng2-cookies';
import { TaskService } from './service/task.service';
import { ChangePasswordComponent } from './component/login/change-password/change-password.component';
import { UsersComponent } from './component/dashboard/users/users.component';
import { StoreComponent } from './component/dashboard/store/store.component';
import { ProfileComponent } from './component/dashboard/profile/profile.component';
import { CustomersComponent } from './component/dashboard/customers/customers.component';
import { MessageService } from './service/message.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BaseDateComponent } from './component/dashboard/task/base-date/base-date.component';
import { DocumentPreviewComponent } from './component/dashboard/document-preview/document-preview.component';
import { UserDetailsComponent } from './component/dashboard/users/user-details/user-details.component';

import { UrlSerializer } from '@angular/router';
import { StandardUrlSerializer } from './standardUrlSerializer';
import '@progress/kendo-angular-intl/locales/de/all';
import { ParametersComponent } from './component/dashboard/parameters/parameters.component';
import { ParameterItemComponent } from './component/dashboard/parameters/parameter-item/parameter-item.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    routingComponents,
    DashboardComponent,
    TaskComponent,
    ChangePasswordComponent,
    UsersComponent,
    StoreComponent,
    ProfileComponent,
    CustomersComponent,
    BaseDateComponent,
    DocumentPreviewComponent,
    UserDetailsComponent,
    ParametersComponent,
    ParameterItemComponent,
    MyNavigationComponent,
    MyNavigationViewComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    HttpClientJsonpModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    SchedulerModule,
    DateInputsModule,
    GridModule,
    ExcelModule,
    PDFModule,
    ButtonsModule,
    ModalModule,
    DropDownsModule,
    InputsModule,
    ColorPickerModule,
    LayoutModule,
    SplitterModule,
    IntlModule,
    UploadModule,
    DialogModule,
    FileUploadModule,
    PdfViewerModule

  ],
  providers: [
    LoginComponent,
    MailService,
    CookieService,
    TaskService,
    LoggedGuard,
    DashboardGuard,
    LoginGuard,
    MessageService,
    {
      provide: UrlSerializer,
      useClass: StandardUrlSerializer
    },
    StandardUrlSerializer
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

