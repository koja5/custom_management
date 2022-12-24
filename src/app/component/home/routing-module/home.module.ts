import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  PerfectScrollbarConfigInterface,
  PERFECT_SCROLLBAR_CONFIG,
} from "ngx-perfect-scrollbar";
import { HomedRouting } from "./home-routing";
import { HomePageComponent } from "../pages/home-page/home-page.component";
import { HomeNavigationMenuComponent } from "../home-navigation-menu/home-navigation-menu.component";
import { FormsModule } from "@angular/forms";
import { RequestDemoComponent } from "../pages/request-demo/request-demo.component";
import { HomeFooterComponent } from "../home-footer/home-footer.component";
import { FooterSectionComponent } from "../footer-section/footer-section.component";
import { PriceComponent } from "../pages/price/price.component";
import { HeaderSectionComponent } from "../header-section/header-section.component";
import { SubscribeSectionComponent } from "../subscribe-section/subscribe-section.component";
import { AboutUsComponent } from "../pages/about-us/about-us.component";
import { ContactUsComponent } from "../pages/contact-us/contact-us.component";
import { FeaturesComponent } from "../pages/features/features.component";
import { FeatureSectionComponent } from "../sections/feature-section/feature-section.component";
import { HomeComponent } from "../home/home.component";
import { DynamicPaymentFormComponent } from "../../dynamic-elements/dynamic-payment-form/dynamic-payment-form.component";
import { ModalModule } from "ngx-modal";
import { DialogModule } from "@progress/kendo-angular-dialog";
import { ButtonModule } from "@progress/kendo-angular-buttons";
import { PaymentSuccessComponent } from "../pages/request-demo/payment-success/payment-success.component";
import { PaidLicenceComponent } from "../../dashboard/licence/paid-licence/paid-licence.component";
import { SharedComponentsModule } from "src/app/shared/shared-components.module";
const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [
    HomePageComponent,
    RequestDemoComponent,
    HomeNavigationMenuComponent,
    HomeFooterComponent,
    FooterSectionComponent,
    PriceComponent,
    HeaderSectionComponent,
    SubscribeSectionComponent,
    AboutUsComponent,
    ContactUsComponent,
    FeaturesComponent,
    FeatureSectionComponent,
    HomeComponent,
    DynamicPaymentFormComponent,
    PaymentSuccessComponent,
  ],
  exports: [
    HomePageComponent,
    RequestDemoComponent,
    HomeNavigationMenuComponent,
    HomeFooterComponent,
    FooterSectionComponent,
    PriceComponent,
    HeaderSectionComponent,
    SubscribeSectionComponent,
    AboutUsComponent,
    ContactUsComponent,
    FeaturesComponent,
    FeatureSectionComponent,
    HomeComponent,
    DynamicPaymentFormComponent,
    PaymentSuccessComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HomedRouting,
    ModalModule,
    DialogModule,
    ButtonModule,
    SharedComponentsModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
})
export class HomedModule {}
