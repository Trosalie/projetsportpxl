import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {LoginPage} from './login-page/login-page';
import { PhotographDashboard } from './photograph-dashboard/photograph-dashboard';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { photographGuard } from './guards/photograph.guard';
import { adminGuard } from './guards/admin.guard';
import {ForgottenPassword} from './forgotten-password/forgotten-password';

const routes: Routes = [
  { path: '', component: PhotographDashboard, pathMatch: 'full', canMatch: [photographGuard] },
  { path: 'request/payout', component: MailRequestPage, canActivate: [photographGuard] },
  { path: 'request/credits', component: MailRequestPage, canMatch: [photographGuard] },
  { path: 'request/success', component: AutomaticResponse, canMatch: [photographGuard] },
  { path: 'request/failure', component: AutomaticResponse, canMatch: [photographGuard] },
  { path: 'forgotten-password', component: ForgottenPassword },
  { path: 'login-page', component: LoginPage }
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule, HttpClientModule]
})
export class AppRoutingModule { }
