import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionInfo } from './SessionInfo';
import { ApiConfigService } from 'src/app/config.service';
import { environment } from 'src/environments/environment';
import { AppService } from 'src/app/app.service';


@Injectable({
  providedIn: 'root'
})
export class ApplicationHttpClientService {

  private sessionInfo: SessionInfo;
  private token: any;

  private _userId: number;
  private _userName: string;
  set userId(value: number) {
    this._userId = value;
  }
  get userId() {
    return this._userId;
  }

  set userName(value: string) {
    this._userName = value;
  }
  get userName() {
    return this._userName;
  }


  constructor(
    private configService: ApiConfigService,
    public http: HttpClient, private appService: AppService, private apiConfigService: ApiConfigService) {
  }

  public setSessionInfo(sessionInfo: SessionInfo): void {
    this.sessionInfo = sessionInfo;
  }

  public validateParentSession(sessionInfo: SessionInfo): Observable<any> {
    return this.updateLoginActionTime();
  }

  checkServer() {
    let PROD_URL: string = '';
    if (environment.production) {
      const href: string = window.location.href;
      const path = this.appService.generateDynamicUrl(href);
      const host = window.location.host;
      const protocol = this.apiConfigService.properties['protocol'];
      PROD_URL = `${protocol}://${host}/${path}/ppservices/common/awakeServer`;
    } else {
      PROD_URL = 'http://localhost:8090/PartnerManagement/ppservices/common/awakeServer';
    }
    return this.http.get(PROD_URL);
  }

  updateLoginActionTime() {
    const { url, params } = this.getUpdateTokenURLandParams();
    return this.http.post(url, params);
  }

  setToken(token: any) {
    this.token = token;
  }

  getToken(): any {
    return this.token;
  }

  public getUpdateTokenURLandParams() {
    const params = new SessionInfo();
    params.productIdentifier = this.apiConfigService.tokenProperties['productIdentifier'];
    params.userId = this._userId;
    params.userName = this._userName;
    let url: string = '';
    if (environment.production) {
      const href: string = window.location.href;
      const path = this.appService.generateDynamicUrl(href);
      const host = window.location.host;
      const protocol = this.apiConfigService.properties['protocol'];
      url = `${protocol}://${host}/${path}/ppservices/common/updatesessiongettoken`;
    } else {
      url = 'http://localhost:8090/PartnerManagement/ppservices/common/updatesessiongettoken';
    }
    return { url, params };
  }
}
