import { DEFAULT_CURRENCY_CODE, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './header/header';
import { Title } from './title/title';
import { PhotographerDashboard } from './photographer-dashboard/photographer-dashboard';
import { InvoiceHistory } from './invoice-history/invoice-history';
import { InvoiceCard } from './invoice-card/invoice-card';
import { InvoiceFilter } from './invoice-filter/invoice-filter';
import { PhotographerRequest } from './photographer-request/photographer-request';
import { AutomaticResponse } from './automatic-response/automatic-response';
import { MailRequestPage } from './mail-request-page/mail-request-page';
import { FormsModule } from '@angular/forms';


import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';

import localeFr from '@angular/common/locales/fr';
import { NavigationBar } from './navigation-bar/navigation-bar';
import { PhotographersList } from './photographers-list/photographers-list';
import { PhotographerCard } from './photographer-card/photographer-card';
import { SearchBar } from './search-bar/search-bar';
import { Pagination } from './pagination/pagination';
import { CreditPurchaseForm } from './credit-purchase-form/credit-purchase-form';
import { Popup } from './popup/popup';
registerLocaleData(localeFr);

@NgModule({
  declarations: [
    App,
    Header,
    Title,
    PhotographerDashboard,
    InvoiceHistory,
    InvoiceCard,
    InvoiceFilter,
    PhotographerRequest,
    AutomaticResponse,
    MailRequestPage,
    NavigationBar,
    PhotographersList,
    PhotographerCard,
    SearchBar,
    Pagination,
    CreditPurchaseForm,
    Popup
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
