import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginPage} from './login-page/login-page';
import { PhotographerDashboard } from './photographer-dashboard/photographer-dashboard';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { photographerGuard } from './guards/photographer.guard';
import { adminGuard } from './guards/admin.guard';
import { loginGuard } from './guards/login.guard';
import { PhotographersList } from './photographers-list/photographers-list';
import { CreditPurchaseForm } from './credit-purchase-form/credit-purchase-form';
import {ProfileInformation} from './profile-information/profile-information';
import { TurnoverPaymentForm } from './turnover-payment-form/turnover-payment-form';
import { MailsLog } from './mails-log/mails-log';
import { AdminPhotographerInvoiceList } from './admin-photographer-invoice-list/admin-photographer-invoice-list';
import { GeneralGraph } from './general-graph/general-graph';
import { Logs } from './logs/logs';
import { AboutUs } from './about-us/about-us';
import { NewPhotographerForm } from './new-photographer-form/new-photographer-form';
import { EditPhotographerForm } from './edit-photographer-form/edit-photographer-form';

const routes: Routes = [
  { path: 'login', component: LoginPage, canActivate: [loginGuard] },
  { path: '', component: PhotographerDashboard, pathMatch: 'full', canActivate: [photographerGuard] },
  { path: 'photographers', component: PhotographersList, canActivate: [adminGuard] },
  { path: 'photographer/:id/invoices', component: AdminPhotographerInvoiceList, canActivate: [adminGuard] },
  { path: 'request/payout', component: MailRequestPage, canActivate: [photographerGuard] },
  { path: 'request/credits', component: MailRequestPage, canActivate: [photographerGuard]},
  { path: 'mails', component: MailsLog, canActivate: [photographerGuard]},
  { path: 'form/credits', component: CreditPurchaseForm, canActivate: [adminGuard]},
  { path: 'form/payout', component: TurnoverPaymentForm, canActivate: [adminGuard]},
  { path: 'photographer/:id', component: ProfileInformation, canActivate: [adminGuard]},
  { path: 'general-graph', component: GeneralGraph, canActivate: [adminGuard]},
  { path: 'logs', component: Logs, canActivate: [adminGuard]},
  { path: 'about-us', component: AboutUs, canActivate: [photographerGuard]},
  { path: 'new/photographer', component: NewPhotographerForm, canActivate: [adminGuard]},
  { path: 'edit/photographer/:id', component: EditPhotographerForm, canActivate: [adminGuard]},
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
