import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from '../dashboard.component';
import { ParametersComponent } from './parameters.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: "home",
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'parameters', pathMatch: 'full' },
      {
        path: 'parameters',
        component: ParametersComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ParametersRouting {}
