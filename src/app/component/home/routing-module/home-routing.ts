import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { AboutUsComponent } from '../pages/about-us/about-us.component';
import { ContactUsComponent } from '../pages/contact-us/contact-us.component';
import { FeaturesComponent } from '../pages/features/features.component';
import { HomePageComponent } from '../pages/home-page/home-page.component';
import { PriceComponent } from '../pages/price/price.component';
import { PaymentSuccessComponent } from '../pages/request-demo/payment-success/payment-success.component';
import { RequestDemoComponent } from '../pages/request-demo/request-demo.component';

const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'request-demo',
    component: RequestDemoComponent,
  },
  {
    path: 'request-demo/:package',
    component: RequestDemoComponent,
  },
  {
    path: 'payment-success/:id',
    component: PaymentSuccessComponent
  },
  {
    path: 'prices',
    component: PriceComponent,
  },
  {
    path: 'about-us',
    component: AboutUsComponent,
  },
  {
    path: 'contact-us',
    component: ContactUsComponent,
  },
  {
    path: 'features',
    component: FeaturesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomedRouting {}
