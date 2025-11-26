import {DEFAULT_CURRENCY_CODE, NgModule, provideBrowserGlobalErrorListeners} from '@angular/core';
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
import { LoginPage } from './login-page/login-page';
import { PhotographRequest } from './photograph-request/photograph-request';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { MailRequestPage } from './mail-request-page/mail-request-page';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';

import localeFr from '@angular/common/locales/fr';
import {FormsModule} from "@angular/forms";
registerLocaleData(localeFr);

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
    MailRequestPage,
    InvoiceFilter,
    LoginPage,
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule
    ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' }
  ],
  bootstrap: [App]
})
export class AppModule { }
