import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultService, FilterMap, PartnerInfo } from 'partnermanagement-api';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { FieldConfig } from 'dynamic-form';
import { CommonService } from 'src/app/common/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { customMessages, API } from 'src/app/common/utility/constants';
import { DataService } from 'src/app/common/services/data.service';
import { AppService } from 'src/app/app.service';
import { ApiConfigService } from 'src/app/config.service';

@Injectable({
  providedIn: 'root'
})
export class PartnerSearchService {

  jsonDataLabels = { email: '', confirmEmail: '', companyName: ''};

  constructor(private dataService: DataService,  private pmService: DefaultService, private formBuilder: FormBuilder, private commonService: CommonService, private appService: AppService) { }

  setLabels(data: any) {
    this.jsonDataLabels.email = data[0].configure.emaillabel;
    this.jsonDataLabels.confirmEmail = data[0].configure.confirmEmaillabel;
    this.jsonDataLabels.companyName = data[0].configure.companyName;
  }

  getLabels(): any {
    return this.jsonDataLabels;
  }

  removeDisable(controls: any) {
    // tslint:disable-next-line: forin
    for (const val in controls) {
      controls[val].enable();
    }
  }

  addDisable(controls: any) {
    // tslint:disable-next-line: forin
    for (const val in controls) {
      controls[val].disable();
    }
  }

  getBase64url(arr: any, dfnIdmap: any, mapSelectedVal: any): any {
    arr.forEach(element => {
      if (element.type.toLowerCase() === 'file') {
        if (mapSelectedVal[dfnIdmap[element.name]] && mapSelectedVal[dfnIdmap[element.name]] !== '') {
          const mime = this.commonService.base64MimeType(mapSelectedVal[dfnIdmap[element.name]]);
          element.value = this.commonService.dataURLtoFile(mapSelectedVal[dfnIdmap[element.name]], element.name + '.' + mime);
          //element.value = mapSelectedVal[dfnIdmap[element.name]];
          mapSelectedVal[dfnIdmap[element.name]] = element.value;
        }
      }
    });
    return mapSelectedVal;
  }

  configureProfileData(arr: any) {
    let retArr = [];
    if(arr && arr.length) {
      retArr = arr.map((e: any, i: any) => {
        return {
          ...e,
          ['fullName']: this.getFullName(e.infoData),
          ['companyName']: this.getCompanyName(e.infoData),
          ['companyAbbr']: this.getCompanyAbbr(e.infoData),
          ['logo']: this.getLogo(e.infoData)
        };
      });
    }
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

  getProfilesSelected(allProfiles: any) {
    return allProfiles.filter(val => val.selected === true);
  }

  statusSelected(statusSelected: any) {
    const arrStatus = [];
    for (const property in statusSelected) {
      if (statusSelected[property]) {
        arrStatus.push(property);
      }
    }
    return arrStatus;
  }

  setProfileInitial(allProfileData: any) {
    const arrWithPartnerId = [];
    allProfileData.forEach(character => {
      // tslint:disable-next-line: radix
      arrWithPartnerId.push(parseInt(character.partnerId));
    });
    return Math.max(...arrWithPartnerId);
  }

  getGroupsFormControls(kpiGroup) {
    if (kpiGroup && kpiGroup.length) {
      const definitionGroup = this.formBuilder.group({});
      kpiGroup.forEach(definition => {
        const validatorsArray: Array<any> = this.bindValidations(definition);
        const ctrl = this.formBuilder.control('', validatorsArray);
        definitionGroup.addControl(definition.dfnName, ctrl);
      });
      definitionGroup.setValidators(this.confirmEmailValidator());
      return definitionGroup;
    }
  }

  confirmEmailValidator(): ValidatorFn {
    const jsonLabels = this.getLabels();
    const emailLabel = jsonLabels.email;
    const confirmEmailLabel = jsonLabels.confirmEmail;
    return (group: FormGroup): ValidationErrors => {
      const email = group.controls[emailLabel];
      const confirmEmail = group.controls[confirmEmailLabel];
      if (email && confirmEmail) {
        if (email.value.toLowerCase() !== confirmEmail.value.toLowerCase()) {
          confirmEmail.setErrors({ notEquivalent: customMessages.emailConfirmEmailMatch });
        } else {
          confirmEmail.setValidators([Validators.required]);
        }
      }
      return;
    };
  }

  getGroupsFormConfig(kpiGroup) {
    if (kpiGroup && kpiGroup.length) {
      const grpConfigArray = [];
      kpiGroup.sort((a, b) => {
        return a.dfnOrder - b.dfnOrder;
      });
      kpiGroup.forEach(definition => {
          const configObjOld: any = this.mapConfigDataOld(definition);
          grpConfigArray.push(configObjOld);
      });
      return grpConfigArray;
    }
  }

  mapConfigDataOld(definition) {
    const configObj: FieldConfig = {} as any;
    configObj.type = (definition.fieldType).toString().toLowerCase() === 'grid' ? 'select' : (((definition.fieldType).toString().toLowerCase() === 'plan-element') ? 'plan' : (definition.fieldType).toString().toLowerCase());
    configObj.name = definition.dfnName;
    configObj.label = definition.dfnName;
    configObj.value = '';

    // tslint:disable-next-line: max-line-length
    if (((definition.fieldType).toString().toLowerCase() === 'multiselect' || (definition.fieldType).toString().toLowerCase() === 'radiobutton' || (definition.fieldType).toString().toLowerCase() === 'select') && definition.fieldOptions && definition.fieldOptions !== '') {
      configObj.options = definition.fieldOptions.toString().split(',');
    } else if ((definition.fieldType).toString().toLowerCase() === 'grid' && definition.weightages && definition.weightages.length) {
      configObj.options = definition.weightages.map(weight => weight.type);
    }

    configObj.validations = [];
    configObj.validations = this.mapValidations(definition.validations);

    return configObj;
  }

  formPanelDataObjectOnlink(panelDataContent: any) {
    const kpiDataMap = {};
    if (panelDataContent && panelDataContent.length) {
      panelDataContent.forEach(kpi => {
          if (!kpiDataMap[kpi.kpi_name]) {
            kpiDataMap[kpi.kpi_name] = kpi.value;
          }
      });
    }
    return kpiDataMap;
  }

  formSelectedMap(selectedLeftProfile: any, formGrpmap: any) {
    const mapSelectedVal = { dfnId: '', dfnVal: '' };
    selectedLeftProfile.infoData.forEach(item => {
      if (item && !mapSelectedVal[item.dfnId]) {
        let dfnValAfterConversion: any;
        if (item && item.dfnVal) {
          const isMultiSelect = item.dfnVal.startsWith('multiselect#&#');
          isMultiSelect ? dfnValAfterConversion = this.getArryFromStrings(item.dfnVal) : dfnValAfterConversion = item.dfnVal;
        } else {
          dfnValAfterConversion = '';
        }
        mapSelectedVal[item.dfnId] = dfnValAfterConversion;
      }
    });
    return mapSelectedVal;
  }

  getArryFromStrings(str: string): any {
    if (str && str.length) {
      const valStrMultiselect = str.substring('multiselect#&#'.length);
      return valStrMultiselect.split(', ');
    } else {
      return [];
    }
  }

  mapValidations(validationsArray: Array<any>) {
    const mappedArray = [];
    if (validationsArray && validationsArray.length) {
      validationsArray.forEach(item => {
        const Obj: { name: string, message: string, validator: Validators } = {
          name: item.validationName,
          message: item.validationMsg,
          validator: this.getValidator(item)
        };
        mappedArray.push({ name: item.validationName, message: item.validationMsg, validator: this.getValidator(item) });
      });
    }
    return mappedArray;
  }

  bindValidations(definition) {
    const validatorsArray = [];
    if (definition.validations && definition.validations.length) {
      definition.validations.forEach(validationItem => {
        const item = this.getValidator(validationItem);
        validatorsArray.push(item);
      });
    }
    return validatorsArray;
  }

  getDefinitionsIds(kpiGroup) {
    if (kpiGroup && kpiGroup.length) {
      const defIdsMap = {};
      kpiGroup.forEach(definition => {
          if (!defIdsMap[definition.dfnName]) {
            defIdsMap[definition.dfnName] = definition.dfnId;
          }
      });
      return defIdsMap;
    }
  }

  getValidator(validationObject): Validators {
    let validation: any;
    switch (validationObject.validationName) {
      case 'required': validation = Validators.required;
                       break;
      case 'min': validation = Validators.min(validationObject.value);
                  break;
      case 'max': validation = Validators.max(validationObject.value);
                  break;
      case 'minlength': validation = Validators.minLength(validationObject.value);
                        break;
      case 'maxlength': validation = Validators.maxLength(validationObject.value);
                        break;
      case 'email': validation = Validators.email;
                    break;
      case 'pattern': validation = Validators.pattern(validationObject.value);
                      break;
    }
    return validation;
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control.markAsTouched({ onlySelf: true });
    });
  }

  mapFormGroupToCreatePartnerRequest(groupData, defIdsMap) {
    const definitionArray: Array<{ dfnId: number, dfnName: string, dfnVal: string }> = [];
    // tslint:disable-next-line: forin
    for (const key in groupData) {
      let defValString = '';
      const isArrayValue = Array.isArray(groupData[key]);
      isArrayValue ? defValString = groupData[key].join(', ') : defValString = groupData[key];
      definitionArray.push({ dfnId: defIdsMap[key], dfnName: key, dfnVal: defValString });
    }
    return definitionArray;
  }

  bindSelectedProfileData(id: any, selectedProfile: any, allProfileData: any): any {
    const arrRet = this.commonService.findFieldIndex(allProfileData, id, 'partnerId');
    selectedProfile.companyName = arrRet && arrRet.length > 0 && arrRet[0].companyName;
    selectedProfile.profileName = arrRet && arrRet.length > 0 && arrRet[0].profileName;
    selectedProfile.slectedDate = arrRet && arrRet.length > 0 && arrRet[0].createdDate;
    selectedProfile.status = arrRet && arrRet.length > 0 && (arrRet[0].status ? arrRet[0].status : 'preactive');
    selectedProfile.preOnBoardScore = arrRet && arrRet.length > 0 && arrRet[0].preOnBoardScore;
    selectedProfile.postOnBoardScore = arrRet && arrRet.length > 0 && arrRet[0].postOnBoardScore;
    selectedProfile.blockChainStatus = arrRet && arrRet.length > 0 && arrRet[0].blockChainStatus;
    selectedProfile.originalCmpName = arrRet && arrRet.length > 0 && arrRet[0].companyName;
    selectedProfile.workStepTeam = arrRet && arrRet.length > 0 && arrRet[0].workStepTeam;
    selectedProfile.statusInWorkStepTeam = arrRet && arrRet.length > 0 && arrRet[0].statusInWorkStepTeam;
    selectedProfile.wfProcessInstanceId = arrRet && arrRet.length > 0 && arrRet[0].wfProcessInstanceId;
    return selectedProfile;
  }

  formPanelDataObject(id: any, panelDataView: any, allProfileData: any): any {
    panelDataView = {};
    const panelDataViewarr = allProfileData.filter(partnerData => partnerData.partnerId === id);
    if (panelDataViewarr && panelDataViewarr.length > 0 ) { panelDataView = panelDataViewarr[0]; }
    return panelDataView;
  }

  partnerReuqestPutObject(selectedProfile: any): PartnerInfo {
    const partnerRequest: PartnerInfo = {} as any;
    // tslint:disable-next-line: forin
    partnerRequest.profileName = selectedProfile.profileName;
    partnerRequest.createdDate = selectedProfile.slectedDate;
    // tslint:disable-next-line: radix
    partnerRequest.preOnBoardScore = selectedProfile.preOnBoardScore ? parseInt(selectedProfile.preOnBoardScore) : null;
    // tslint:disable-next-line: radix
    partnerRequest.postOnBoardScore = selectedProfile.postOnBoardScore ? parseInt(selectedProfile.postOnBoardScore) : null;
    partnerRequest.status = selectedProfile.status;
    partnerRequest.blockChainStatus = selectedProfile.blockChainStatus;
    partnerRequest.workStepTeam = selectedProfile.workStepTeam;
    partnerRequest.statusInWorkStepTeam = selectedProfile.statusInWorkStepTeam;
    partnerRequest.wfProcessInstanceId = selectedProfile.wfProcessInstanceId;
    partnerRequest.infoData = [];
    return partnerRequest;
  }

  bindFormControlOnLink(kpiName, kpiDeatils, objkpiDataMap) {
    let valRetToBind = '';
    if (!isNaN(+(objkpiDataMap[kpiName]).toString().charAt(0))) {
      if (objkpiDataMap[kpiName].toString().indexOf('-') !== -1) {
        const kpiCrawedVal = objkpiDataMap[kpiName].split('-');
        if (kpiCrawedVal.length >= 2) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal[1]);
        } else if (kpiCrawedVal.length === 1) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal[0]);
        }
      } else if (objkpiDataMap[kpiName].toString().indexOf('+') !== -1) {
        const kpiCrawedVal = objkpiDataMap[kpiName].replace(/\+/g, '');
        if (!isNaN(kpiCrawedVal)) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal);
        }
      } else if (objkpiDataMap[kpiName].toString().indexOf('>') !== -1) {
        const kpiCrawedVal = objkpiDataMap[kpiName].replace(/\>/g, '');
        if (!isNaN(kpiCrawedVal)) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal);
        }
      } else if (objkpiDataMap[kpiName].toString().indexOf('<') !== -1) {
        const kpiCrawedVal = objkpiDataMap[kpiName].replace(/\</g, '');
        if (!isNaN(kpiCrawedVal)) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal);
        }
      } else if (objkpiDataMap[kpiName].toString().indexOf('%') !== -1) {
        const kpiCrawedVal = objkpiDataMap[kpiName].replace(/\%/g, '');
        if (!isNaN(kpiCrawedVal)) {
          valRetToBind = this.checkTheRange(kpiDeatils, kpiCrawedVal);
        }
      } else  {
        valRetToBind = this.checkTheRange(kpiDeatils, objkpiDataMap[kpiName]);
      }
    } else {
      if (kpiDeatils && kpiDeatils.length > 0) {
        kpiDeatils[0].options.forEach(dropdownValue => {
          if (dropdownValue.toLowerCase() === objkpiDataMap[kpiName].toLowerCase()) {
            valRetToBind = dropdownValue;
            return;
          }
        });
      }
    }
    return valRetToBind;
  }

  checkTheRange(kpiDeatils: any, kpiCrawledValed: any): any {
    for ( let i = 0; i < kpiDeatils[0].options.length; i++) {
      const dropdownValue = kpiDeatils[0].options[i].replace(/ /g, '');
      if (dropdownValue.toString().indexOf('-') !== -1) {
        const rangeArr = dropdownValue.split('-');
        if (kpiCrawledValed && rangeArr.length > 1 && parseFloat(kpiCrawledValed) <= (parseFloat(rangeArr[1]))) {
          return kpiDeatils[0].options[i];
        }
      } else if (dropdownValue.toString().indexOf('+') !== -1) {
        const mofifieddropdownValue = dropdownValue.replace(/\+/g, '');
        if (kpiCrawledValed && mofifieddropdownValue && parseFloat(kpiCrawledValed) >= (parseFloat(mofifieddropdownValue))) {
          return kpiDeatils[0].options[i];
        }
      } else if (dropdownValue.toString().indexOf('<') !== -1) {
        const mofifieddropdownValue = dropdownValue.replace(/\</g, '');
        if (kpiCrawledValed && mofifieddropdownValue && parseFloat(kpiCrawledValed) <= (parseFloat(mofifieddropdownValue))) {
          return kpiDeatils[0].options[i];
        }
      } else if (dropdownValue.toString().indexOf('>') !== -1) {
        const mofifieddropdownValue = dropdownValue.replace(/\>/g, '');
        if (kpiCrawledValed && mofifieddropdownValue && parseFloat(kpiCrawledValed) >= (parseFloat(mofifieddropdownValue))) {
          return kpiDeatils[0].options[i];
        }
      }
    }
  }

  formatProfiles(profiles: any, isExactMatch: boolean): any [] {
    const arrProfiles = [];
    profiles.forEach(element => {
      const objProile = {} as any;
      objProile.isExactMatch = isExactMatch;
      objProile.name = element.name;
      objProile.image = '';
      arrProfiles.push(objProile);
    });
    return arrProfiles;
  }

  getConfigurationAPI(): any {
    return this.dataService.externalGet(API.getConfigureKPIJson);
  }

  getConfiguration(value: any): any {
    return this.pmService.getprofileinfos(value);
  }

  getLeftSideConfigurationData(initialPage: number, lastPage: number, filterProfile?: Array<string>, filterStatus?: Array<string>, filterCreatedFromDate?: string, filterCreatedToDate?: string, filterMap?: FilterMap[]): any {
    const filterArr = filterMap ? filterMap : [];
    return this.pmService.getPartnersInfoPaginatedPost(initialPage, lastPage, filterProfile, filterStatus, filterCreatedFromDate, filterCreatedToDate, filterArr );
  }

  getSinglePartnerInfoByPartnerId(partnerId: number) {
    return this.pmService.getpartnerInfoEntity(partnerId.toString());
  }

  getProfiles(): Observable<any> {
    return this.pmService.getprofiles();
  }

  updatePartner(partnerId: any, partnerRequest: PartnerInfo): Observable<any> {
    const userName = this.appService.logindetails && this.appService.logindetails['usrName'] ? this.appService.logindetails['usrName'] : '';
    return this.pmService.updatepartnerInfoEntity(partnerId, partnerRequest, userName);
  }

  getProspectProfileData(companyName: any) {
    return this.dataService.getAll(ApiConfigService.urlDetails.panelDataForProfile + companyName);
  }

  getBLockchainDetails(partnerId: any) {
    return this.pmService.getBlockchainDetailsByPartnerId(partnerId);
  }
}
