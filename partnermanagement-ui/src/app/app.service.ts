import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/internal/operators/map';
import { ApiConfigService } from './config.service';
import { Title } from '@angular/platform-browser';
import { of, Observable } from 'rxjs';
import { ToolBar } from './common/models/toolbar.model';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private httpClient: HttpClient,
    private appConfigService: ApiConfigService,
    private titleService: Title) { }

 // tslint:disable-next-line: variable-name
  private _loginDetails = {} as any;
  private _sessionID = "";
  toolBarUrl = ''
  get logindetails() {
    this.setSessionID('');
    return this._loginDetails;
  }

  setSessionID(sessionId: string){
    this._sessionID = sessionId;
  }

  getSessionID(){
    return this._sessionID;
  }

  public getLoggedInUserDetails() {
    let changePwdUrl = '';
    const protocol = this.appConfigService.applicationProperties['protocol'];
    if (!environment.production) {
      this._loginDetails =  {"allowNestedValues":true,"id":1,"reDrawOnSelectionChange":true,"displayString":"Root","currentPassword":null,"usrPassword":null,"confirmPassword":null,"usrName":"Root ","fromUserScreen":true,"minPasswordLength":6,"cache":{"minPasswordLength":null,"fromUserScreen":false,"confirmPassword":null,"usrName":null,"usrPassword":null,"currentPassword":null},"auditingInfo":{"com.subex.fs.auditing.AuditingKey@43be91e5":null,"com.subex.fs.auditing.AuditingKey@2937f7b":null,"com.subex.fs.auditing.AuditingKey@24f724c5":null},"jsModuleName":"changePasswordDetail","allModelObjects":[],"idLong":1,"dirty":true,"properties":{"extraArgDfnModelList":null,"LimitExceeded":false,"ExtraControl":"","forceAlphaNumericValue":"N","abstractEntityTbl":{"allowNestedValues":true,"id":436,"reDrawOnSelectionChange":true,"displayString":"UserPassword","entEntity":"UserPassword","entDisplay":"User Password","cache":{},"dirty":false,"idLong":-2273,"properties":{},"propertyNames":[]},"rolePartitionsNames":[{"id":1,"versionId":1,"deleteFl":false,"systemGeneratedFl":false,"partitionId":-1,"isNew":false,"auditInfo":null,"abstractEntEntity":null,"abstractAuditLevel":0,"createdDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"createdUsrId":0,"modifiedDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"modifiedUsrId":0,"ptnName":"Common","displayString":"Common","displayValue":"Common","ptnId":1,"auditingDisplayString":"Common","simpleDisplayString":null,"new":false,"auditHibernateObject":null},{"id":3,"versionId":1,"deleteFl":false,"systemGeneratedFl":false,"partitionId":-1,"isNew":false,"auditInfo":null,"abstractEntEntity":null,"abstractAuditLevel":0,"createdDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"createdUsrId":0,"modifiedDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"modifiedUsrId":0,"ptnName":"IoT","displayString":"IoT","displayValue":"IoT","ptnId":3,"auditingDisplayString":"IoT","simpleDisplayString":null,"new":false,"auditHibernateObject":null},{"id":4,"versionId":1,"deleteFl":false,"systemGeneratedFl":false,"partitionId":-1,"isNew":false,"auditInfo":null,"abstractEntEntity":null,"abstractAuditLevel":0,"createdDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"createdUsrId":0,"modifiedDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"modifiedUsrId":0,"ptnName":"Voice","displayString":"Voice","displayValue":"Voice","ptnId":4,"auditingDisplayString":"Voice","simpleDisplayString":null,"new":false,"auditHibernateObject":null},{"id":5,"versionId":1,"deleteFl":false,"systemGeneratedFl":false,"partitionId":-1,"isNew":false,"auditInfo":null,"abstractEntEntity":null,"abstractAuditLevel":0,"createdDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"createdUsrId":0,"modifiedDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"modifiedUsrId":0,"ptnName":"Enterprise Partner","displayString":"Enterprise Partner","displayValue":"Enterprise Partner","ptnId":5,"auditingDisplayString":"Enterprise Partner","simpleDisplayString":null,"new":false,"auditHibernateObject":null},{"id":6,"versionId":1,"deleteFl":false,"systemGeneratedFl":false,"partitionId":-1,"isNew":false,"auditInfo":null,"abstractEntEntity":null,"abstractAuditLevel":0,"createdDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"createdUsrId":0,"modifiedDttm":{"era":1,"dayOfMonth":1,"year":9999,"dayOfWeek":5,"dayOfYear":1,"millisOfSecond":0,"secondOfMinute":59,"weekOfWeekyear":53,"yearOfEra":9999,"monthOfYear":1,"centuryOfEra":99,"yearOfCentury":99,"weekyear":9998,"secondOfDay":86399,"hourOfDay":23,"millisOfDay":86399000,"minuteOfDay":1439,"minuteOfHour":59,"chronology":{"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"}},"zone":{"fixed":false,"uncachedZone":{"fixed":false,"cachable":true,"id":"Asia/Kolkata"},"id":"Asia/Kolkata"},"millis":253370831399000,"afterNow":true,"beforeNow":false,"equalNow":false},"modifiedUsrId":0,"ptnName":"Ecommerce Partner","displayString":"Ecommerce Partner","displayValue":"Ecommerce Partner","ptnId":6,"auditingDisplayString":"Ecommerce Partner","simpleDisplayString":null,"new":false,"auditHibernateObject":null}],"api-session-id":"105541B622D902F262D3F630449EAB07"},"propertyNames":["extraArgDfnModelList","LimitExceeded","ExtraControl","forceAlphaNumericValue","abstractEntityTbl","rolePartitionsNames","api-session-id"]};
      return of(this._loginDetails);
    } else {
      const href: string = window.location.href;
      const path = this.generateDynamicUrl(href);
      const host = window.location.host;
      changePwdUrl = protocol + '://' + host + '/' + path + '/ppservices/changePassword';
      return this.httpClient.get<any>(changePwdUrl).pipe(
        map(resp => {
          this._loginDetails = resp;
          return resp;
        })
      );
    }
  }

  public logout() {
    sessionStorage.clear();
    let logoutUrl = '';
    const host = location.host;
    const href: string = location.href;
    const path = this.generateDynamicUrl(href);
    const protocol = this.appConfigService.applicationProperties['protocol'];
    if (!environment.production) {
      logoutUrl = 'http://localhost:8090/PartnerManagement/sparkLogin.jsp';
    } else {
      logoutUrl = protocol + '://' + host + '/' + path + '/sparkLogout.html';
    }
    location.href = logoutUrl;
  }

  public generateDynamicUrl(href: string) {
    let path = '';
    const split_one = href.split(':');
    const split2 = split_one[split_one.length - 1].split('/');
    if (split2.length > 0) {
      path = split2[1];
    }
    return path;
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  public getToolBarItems(): Observable<Array<ToolBar>> {
    const host = location.host;
    const href: string = location.href;
    const path = this.generateDynamicUrl(href);
    const protocol = this.appConfigService.applicationProperties['protocol'];
    let params = new HttpParams().set('applicationType', 'PM');
    if (!environment.production) {
      this.toolBarUrl = 'http://127.0.0.1:8090/PartnerManagement/ppservices/dashboard/roleaccessprivillages';
    } else {
      this.toolBarUrl = `${protocol}://${host}/${path}/ppservices/dashboard/roleaccessprivillages`;
    }
    //  const toolBarArr = [{"toolBarName":"Registration","toolBarItems":[{"toolBarItemName":"Registration","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":25},{"toolBarName":"Dashboard","toolBarItems":[{"toolBarItemName":"PM Dashboard","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":23},{"toolBarName":"Workflow","toolBarItems":[{"toolBarItemName":"Workflow","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":27},{"toolBarName":"KPI Configuration","toolBarItems":[{"toolBarItemName":"KPI Configuration","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":26},{"toolBarName":"Partner Search","toolBarItems":[{"toolBarItemName":"Partner Search","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":24}, {"toolBarName":"Audit Log","toolBarItems":[{"toolBarItemName":"Audit Log","actions":["BROWSE","DELETE","CREATE","EXPORT","EDIT"]}],"tolBarOrderNum":28}];
    //  return of(toolBarArr);
    return this.httpClient.get<Array<ToolBar>>(this.toolBarUrl, { params: params });
  }
}
