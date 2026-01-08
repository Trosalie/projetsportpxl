import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginPage} from './login-page/login-page';
import { PhotographerDashboard } from './photographer-dashboard/photographer-dashboard';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { photographerGuard } from './guards/photographer.guard';
import { adminGuard } from './guards/admin.guard';
import { PhotographersList } from './photographers-list/photographers-list';
import { CreditPurchaseForm } from './credit-purchase-form/credit-purchase-form';
import {ProfileInformation} from './profile-information/profile-information';
import { TurnoverPaymentForm } from './turnover-payment-form/turnover-payment-form';
import { MailsLog } from './mails-log/mails-log';
import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list/admin-photographer-invoice-list';
import { TestGraph } from './test-graph/test-graph';
import { GeneralGraph } from './general-graph/general-graph';

const routes: Routes = [
  { path: 'login', component: LoginPage },
  { path: '', component: PhotographerDashboard, pathMatch: 'full', canActivate: [photographerGuard] },
  { path: 'photographers', component: PhotographersList, canActivate: [adminGuard] },
  { path: 'photographers/:id/invoices', component: AdminPhotographerInvoiceList, canActivate: [adminGuard] },
  { path: 'request/payout', component: MailRequestPage, canActivate: [photographerGuard] },
  { path: 'request/credits', component: MailRequestPage, canActivate: [photographerGuard]},
  { path: 'request/success', component: AutomaticResponse, canActivate: [photographerGuard]},
  { path: 'request/failure', component: AutomaticResponse, canActivate: [photographerGuard]},
  { path: 'mails', component: MailsLog, canActivate: [photographerGuard]},
  { path: 'form/credits', component: CreditPurchaseForm, canActivate: [adminGuard]},
  { path: 'form/payout', component: TurnoverPaymentForm, canActivate: [adminGuard]},
  { path: 'photographer/:id', component: ProfileInformation, canMatch: [adminGuard]},
  { path: 'graph', component: TestGraph, canActivate: [adminGuard]},
  {path: 'general-graph', component: GeneralGraph, canActivate: [adminGuard]},
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
