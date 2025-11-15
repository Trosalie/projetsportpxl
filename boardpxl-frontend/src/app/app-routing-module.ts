import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PhotographDashboard } from './photograph-dashboard/photograph-dashboard';
import { PhotographRequest } from './photograph-request/photograph-request';

const routes: Routes = [
  { path: '', component: PhotographDashboard, pathMatch: 'full' },
  { path: 'request/payout', component: PhotographRequest},
  { path: 'request/credits', component: PhotographRequest},
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule, HttpClientModule]
})
export class AppRoutingModule { }
