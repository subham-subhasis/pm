import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {
    constructor(private httpClient: HttpClient, private translateService: TranslateService) { }
    // tslint:disable-next-line: member-ordering
    static localeId = '';
    urlss = {};
    integrationModeApis = {};
    isOauth;
    isLdap;
    idle;
    timeout;
    ping;
    // tslint:disable-next-line: member-ordering
    static urlDetails = {} as any;
    static Urls: any = {};
    static apiUrls = {
        etl: ''
    };

    // tslint:disable-next-line: ban-types
    properties: Object;
    tokenProperties = {};

    loadBootstrapConfiguration() {
        return new Promise((resolve, reject) => {
            this.httpClient.get('./assets/json/applicationConfiguraion.json').subscribe((response: any) => {
                this.urlss['applicationUrl'] = response[0]['applicationUrl'];
                this.isOauth = response[0]['isOauthAuthentication'];
                this.isLdap = response[0]['isLdapAuthentication'];
                this.idle =response[0]['idle'];
                this.timeout = response[0]['timeout'];
                this.ping = response[0]['ping'];
                this.tokenProperties['standaloneMode'] = response[0]['standaloneMode'];
                this.tokenProperties['productIdentifier']=response[0]['productIdentifier'];
                this.integrationModeApis['awakeServer'] = response[0]['parentServerPingApi'];
                this.integrationModeApis['UpdateSessionTime'] = response[0]['parentServersessionTimeUpdaterApi'];
                if (environment.production) {
                    ApiConfigService.apiUrls.etl = response[0].prod.configureApiUrl;
                    ApiConfigService.urlDetails = response[0].prod;
                } else {
                    ApiConfigService.apiUrls.etl = response[0].dev.configureApiUrl;
                    ApiConfigService.urlDetails = response[0].dev;
                }
                if (response) {
                    resolve(true);
                } else {
                    reject('error');
                }
            });
        });
    }

    get applicationProperties() {
        return this.properties;
    }

    setLanguage() {
        this.httpClient.get('./assets/json/propertyFile.json').subscribe((data) => {
            this.properties = data;
            let locale: string = data['locale'];
            locale = locale.indexOf('-') > 0 ?
                locale.substring(0, locale.indexOf('-')) : locale;
            const readFromProperty: boolean = data['readFromProperty'];
            if (readFromProperty) {
                ApiConfigService.localeId = locale;
                this.translateService.setDefaultLang(locale);
            }
        });
    }
}
