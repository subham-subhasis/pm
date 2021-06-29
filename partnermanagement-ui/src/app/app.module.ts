import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, CUSTOM_ELEMENTS_SCHEMA, NgZone } from '@angular/core';

import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { LazyElementsModule, LazyElementsLoaderService } from '@angular-extensions/elements';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { Configuration, ConfigurationParameters, ApiModule, DefaultService } from 'partnermanagement-api';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ApiConfigService } from 'src/app/config.service';
import { SharedModule } from './modules/shared/shared.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ProgressLoaderComponent } from './common/loader-component/progress-loader';
import { MainLoaderComponent } from './common/loader-component/main-loader';
import { SidenavComponent } from './common/sidenav-component/sidenav.component';
import { interceptorProviders } from './common/interceptor/interceptor.service';
import { DataService } from './common/services/data.service';
import { FooterComponent } from './common/footer-component/footer.component';
import { HeaderComponent } from './common/header-component/header.component';

import { ConfigurationComponent } from './modules/configuration/configuration.component';
import { RegistrationComponent } from './modules/registration/registration.component';
import { PartnerSearchComponent } from './modules/partner-search/component/partner-search.component';
import { PartnerSearchService } from './modules/partner-search/service/partner-search.service';
import { OrderByPipe, SearchFilter } from './modules/partner-search/component/partner-search.pipe';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PanelDataViewComponent } from './modules/subex-panel-data/panel-data-view/panel-data-view.component';
import { SearchResultsViewComponent } from './modules/subex-panel-data/search-results-view/search-results-view.component';
import { PanelDataViewService } from './modules/subex-panel-data/panel-data-view/services/panel-data-view.service';
import { SearchResultsViewService } from './modules/subex-panel-data/search-results-view/services/search-results-view.service';
import { PanelDataComponent } from './modules/subex-panel-data/panel-data/panel-data.component';
import { AlertbarComponent } from './modules/shared/alertbar/alertbar.component';
import { BlockchainOrganisationRegisterComponent } from './modules/blockchain-organisation-register/blockchain-organisation-register.component';
import { AuditTrailComponent } from './modules/audit-trail/audit-trail.component';
import { AppService } from './app.service';
import { BlockchainOrganisationRegisterService } from './modules/blockchain-organisation-register/service/blockchain-organisation-register.service';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: ApiConfigService.apiUrls.etl
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    ProgressLoaderComponent,
    SidenavComponent,
    MainLoaderComponent,
    ConfigurationComponent,
    RegistrationComponent,
    PartnerSearchComponent,
    DashboardComponent,
    OrderByPipe,
    SearchFilter,
    PanelDataViewComponent,
    SearchResultsViewComponent,
    PanelDataComponent,
    BlockchainOrganisationRegisterComponent,
    AuditTrailComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    LazyElementsModule,
    SharedModule,
    ApiModule.forRoot(apiConfigFactory),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  exports: [ OrderByPipe,
    SearchFilter, SharedModule ],
  providers: [
    DefaultService,
    PartnerSearchService,
    BlockchainOrganisationRegisterService,
    AppService,
    LazyElementsLoaderService,
    DataService,
    PanelDataViewService,
    SearchResultsViewService,
    interceptorProviders,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: ApiConfigService) => () => config.loadBootstrapConfiguration(),
      deps: [ApiConfigService],
      multi: true
    }
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  bootstrap: [AppComponent],
  entryComponents: [ AlertbarComponent, PanelDataViewComponent, SearchResultsViewComponent, BlockchainOrganisationRegisterComponent ]
})

export class AppModule {
  constructor(private ngZone: NgZone, apiConfigService: ApiConfigService) {
    (window as any).ngZone = this.ngZone;
    apiConfigService.setLanguage();
  }
}
