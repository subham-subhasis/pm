import { Injectable } from '@angular/core';
import { DefaultService } from 'partnermanagement-api';
import { CommonService } from 'src/app/common/services/common.service';
import { customMessages, API } from 'src/app/common/utility/constants';
import { DataService } from 'src/app/common/services/data.service';
import { AppService } from 'src/app/app.service';
import { ApiConfigService } from 'src/app/config.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WorkflowViewService {

  userData = {} as any;
  constructor(private dataService: DataService,
              private pmService: DefaultService,
              private commonService: CommonService,
              private appService: AppService) { }

  configureProfileData(arr: any) {
    const retArr = arr.map((e: any, i: any) => {
      return {
        ...e,
        ['fullName']: this.getFullName(e.infoData),
        ['companyName']: this.getCompanyName(e.infoData),
        ['companyAbbr']: this.getCompanyAbbr(e.infoData),
        ['logo']: this.getLogo(e.infoData)
      };
    });
    return retArr;
  }

  getFullName(arr: any) {
    const name: any = ['', '', ''];
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].dfnName === 'Salutation') {
        name[0] = arr[i].dfnVal + '. ';
        continue;
      }
      if (arr[i].dfnName === 'First Name') {
        name[1] = arr[i].dfnVal + ' ';
        continue;
      }
      if (arr[i].dfnName === 'Last Name') {
        name[2] = arr[i].dfnVal + ' ';
        continue;
      }
    }
    return (name[0] + name[1] + name[2]).toString();
  }

  getCompanyName(arr: any) {
    let companyName: any = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].dfnName === 'Company Name') {
        companyName = companyName + arr[i].dfnVal;
        break;
      }
    }
    return companyName;
  }

  getCompanyAbbr(arr: any) {
    let companyName: any = '';
    let companyAbbr = 'CN';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].dfnName === 'Company Name') {
        companyName = companyName + arr[i].dfnVal;
        break;
      }
    }
    companyName.length > 1 && companyName.split(' ').length >= 2 ? (companyAbbr = (companyName.split(' ')[0].charAt(0).toUpperCase() + companyName.split(' ')[1].charAt(0).toUpperCase())) : (companyName.length > 1 && companyName.split(' ').length === 1 ? (companyAbbr = (companyName.split(' ')[0].charAt(0).toUpperCase())) : (companyAbbr = 'CN'));
    return companyAbbr;
  }

  getLogo(arr: any) {
    let logo = '';
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].dfnName.toLowerCase().indexOf('logo') !== -1) {
        arr[i].dfnVal != null && (logo = logo + arr[i].dfnVal);
        break;
      }
    }
    return logo;
  }

  getUSerDeatilsById(): any {
    return this.userData;
  }

   setUserDeatils(userData: any) {
    this.userData.applicationName = userData.applicationName;
    this.userData.roleName = userData.roleName;
    this.userData.teamName = userData.teamName;
    this.userData.userEmail = userData.userEmail;
    this.userData.userForename = userData.userForename;
    this.userData.userId = userData.userId;
    this.userData.userName = userData.userName;
    this.userData.userSurname = userData.userSurname;
   }

  getConfigurationAPI(): any {
    return this.dataService.externalGet(API.getConfigureKPIJson);
  }

  getPartnersData(): any {
    const isWorkflow = true;
    return this.pmService.getpartnerinfoentities(null, isWorkflow);
  }

  getUserdetails() {
    let userId = this.appService.logindetails && this.appService.logindetails['id'] ? this.appService.logindetails['id'] : '';
    //userId = 3;
    return this.dataService.getAll(ApiConfigService.urlDetails.userInfosForWorkflow + userId);
  }

  approveUser(cardData: any, emailBodyContentFromModal: any) {
    const userName = this.userData.userName;
    const password = ApiConfigService.urlDetails.passwordForapproveOrRejectPM;
    const authorizationData = 'Basic ' + btoa(userName + ':' + password);
    const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authorizationData });
    const obj = {
      partnerId: cardData.partnerId,
      processInstanceId: cardData.wfProcessInstanceId,
      action: 'approve',
      statusInWorkstep: cardData.statusInWorkStepTeam,
      emailBodyContent: emailBodyContentFromModal
    };
    return this.dataService.postData(ApiConfigService.urlDetails.approveOrRejectPM, obj, headers);
  }

  rejectUser(cardData: any, emailBodyContentFromModal: any) {
    const userName =  this.userData.userName;
    const password = ApiConfigService.urlDetails.passwordForapproveOrRejectPM;
    const authorizationData = 'Basic ' + btoa(userName + ':' + password);
    const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authorizationData });
    const obj = {
      partnerId: cardData.partnerId,
      processInstanceId: cardData.wfProcessInstanceId,
      action: 'moveback',
      statusInWorkstep: cardData.statusInWorkStepTeam,
      emailBodyContent: emailBodyContentFromModal
    };
    return this.dataService.postData(ApiConfigService.urlDetails.approveOrRejectPM, obj, headers);
  }

  requestForMoreInfo(cardData: any, emailBodyContentFromModal: any) {
    const userName = this.userData.userName;
    const password = ApiConfigService.urlDetails.passwordForapproveOrRejectPM;
    const authorizationData = 'Basic ' + btoa(userName + ':' + password);
    const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authorizationData });
    const obj = {
      partnerId: cardData.partnerId,
      processInstanceId: cardData.wfProcessInstanceId,
      emailBodyContent: emailBodyContentFromModal
    };
    return this.dataService.postData(ApiConfigService.urlDetails.requestMoreInfo, obj, headers);
  }

  moveToByBucket(cardData: any) {
    const userName = this.userData.userName;
    const password = ApiConfigService.urlDetails.passwordForapproveOrRejectPM;
    const authorizationData = 'Basic ' + btoa(userName + ':' + password);
    const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: authorizationData });
    const obj = {
      partnerId: cardData.partnerId,
      processInstanceId: cardData.wfProcessInstanceId,
      action: 'movetomybucket',
      teamName: cardData.workStepTeam,
      statusInWorkstep: cardData.statusInWorkStepTeam,
      emailBodyContent: ''
    };
    return this.dataService.postData(ApiConfigService.urlDetails.approveOrRejectPM, obj, headers);
  }
}
