import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { PhotographerDashboard } from './photographer-dashboard/photographer-dashboard';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { photographerGuard } from './guards/photographer.guard';
import { adminGuard } from './guards/admin.guard';
import { PhotographersList } from './photographers-list/photographers-list';

const routes: Routes = [
  { path: '', component: PhotographerDashboard, pathMatch: 'full', canMatch: [photographerGuard] },
  { path: '', component: PhotographersList, pathMatch: 'full', canMatch: [adminGuard] },
  { path: 'request/payout', component: MailRequestPage, canActivate: [photographerGuard] },
  { path: 'request/credits', component: MailRequestPage, canMatch: [photographerGuard]},
  { path: 'request/success', component: AutomaticResponse, canMatch: [photographerGuard]},
  { path: 'request/failure', component: AutomaticResponse, canMatch: [photographerGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes), HttpClientModule],
  exports: [RouterModule, HttpClientModule]
})
export class AppRoutingModule { }
