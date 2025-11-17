import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './header/header';
import { Title } from './title/title';
import { PhotographDashboard } from './photograph-dashboard/photograph-dashboard';
import { InvoiceHistory } from './invoice-history/invoice-history';
import { InvoiceCard } from './invoice-card/invoice-card';
import { InvoiceFilter } from './invoice-filter/invoice-filter';
import { PhotographRequest } from './photograph-request/photograph-request';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { MailRequestPage } from './mail-request-page/mail-request-page';

@NgModule({
  declarations: [
    App,
    Header,
    Title,
    PhotographDashboard,
    InvoiceHistory,
    InvoiceCard,
    InvoiceFilter,
    PhotographRequest,
    AutomaticResponse,
    MailRequestPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
