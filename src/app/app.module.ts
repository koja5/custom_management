import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

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
 
// guard
import { LoggedGuard } from './service/login-guard/loggedGuard';
import { LoginGuard } from './service/login-guard/loginGuard';
import { DashboardGuard } from './service/login-guard/dashboardGuard';

//component
import { AppComponent } from './app.component';
import { LoginComponent } from './component/login/login.component';
import { DashboardComponent } from './component/dashboard/dashboard.component';
import { TaskComponent } from './component/dashboard/task/task.component';

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
    CustomersComponent
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
    InputsModule
  ],
  providers: [
    LoginComponent,
    MailService,
    CookieService,
    TaskService,
    LoggedGuard,
    DashboardGuard,
    LoginGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
