import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PhotographDashboard } from './photograph-dashboard/photograph-dashboard';
import { PhotographRequest } from './photograph-request/photograph-request';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { AutomaticResponse } from './automatic-response/automatic-response';

const routes: Routes = [
  { path: '', component: PhotographDashboard, pathMatch: 'full' },
  { path: 'request/payout', component: MailRequestPage},
  { path: 'request/credits', component: MailRequestPage},
  { path: 'request/success', component: AutomaticResponse},
  { path: 'request/failure', component: AutomaticResponse}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule, HttpClientModule]
})
export class AppRoutingModule { }
