import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
//import { KeycloakConfig } from 'keycloak-angular' ;

@Injectable({
    providedIn: 'root'
})
export class ApiConfigService {

    static apiUrls = {
        apiUrl: ''
    };

   // static keycloakConfig: KeycloakConfig;

    constructor(private httpClient: HttpClient) { }

    loadAuditAPIConfigurations() {
        return new Promise((resolve, reject) => {
            this.httpClient.get('assets/json/ngp-audit-trail/conf/auditApi.config.json').subscribe((response: any) => {
                ApiConfigService.apiUrls.apiUrl = response.apiUrl;
               // ApiConfigService.keycloakConfig = response.keycloakConfig;
                if (response) {
                    resolve(true);
                } else {
                    reject('error');
                }
            });
        });
    }
}
