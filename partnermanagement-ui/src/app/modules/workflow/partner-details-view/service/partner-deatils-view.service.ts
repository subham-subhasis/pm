import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DefaultService, PartnerInfo } from 'partnermanagement-api';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { FieldConfig } from 'dynamic-form';
import { CommonService } from 'src/app/common/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { customMessages, API } from 'src/app/common/utility/constants';
import { DataService } from 'src/app/common/services/data.service';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class PartnerDeatilsViewService {

  jsonDataLabels = { email: '', confirmEmail: ''};

  constructor(private dataService: DataService, private translateService: TranslateService, private pmService: DefaultService, private formBuilder: FormBuilder, private commonService: CommonService, private appService: AppService) { }

  getLabels(): any {
    const JSONdata = this.commonService.getJSONData();
    this.jsonDataLabels.email = JSONdata[0].configure.emaillabel;
    this.jsonDataLabels.confirmEmail = JSONdata[0].configure.confirmEmaillabel;
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
        if ( mapSelectedVal[dfnIdmap[element.name]] !== '') {
          const mime = this.commonService.base64MimeType(mapSelectedVal[dfnIdmap[element.name]]);
          element.value = this.commonService.dataURLtoFile(mapSelectedVal[dfnIdmap[element.name]], element.name + '.' + mime);
          mapSelectedVal[dfnIdmap[element.name]] = element.value;
        }
      }
    });
    return mapSelectedVal;
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
          confirmEmail.setErrors(null);
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

  bindSelectedProfileData(selectedProfile: any, profileData: any): any {
    selectedProfile.canEdit = profileData.canEdit;
    selectedProfile.canMoveback = profileData.canMoveback;
    selectedProfile.onApproveEmailBody = profileData.onApproveEmailBody;
    selectedProfile.blockChainStatus = profileData.blockChainStatus;
    selectedProfile.companyAbbr = profileData.companyAbbr;
    selectedProfile.companyName = profileData.companyName;
    selectedProfile.createdDate = profileData.createdDate;
    selectedProfile.fullName = profileData.fullName;
    selectedProfile.infoData = profileData.infoData;
    selectedProfile.logo = profileData.logo;
    selectedProfile.originalCmpName = profileData.originalCmpName;
    selectedProfile.partnerId = profileData.partnerId;
    selectedProfile.postOnBoardScore = profileData.postOnBoardScore;
    selectedProfile.preOnBoardScore = profileData.preOnBoardScore;
    selectedProfile.profileName = profileData.profileName;
    selectedProfile.status = profileData.status;
    selectedProfile.slectedDate = profileData.createdDate;
    selectedProfile.wfProcessInstanceId = profileData.wfProcessInstanceId;
    selectedProfile.statusInWorkStepTeam = profileData.statusInWorkStepTeam;
    selectedProfile.workStepTeam = profileData.workStepTeam;
    return selectedProfile;
  }

  partnerReuqestPutObject(selectedProfile: any): PartnerInfo {
    const partnerRequest: PartnerInfo = {} as any;
    // tslint:disable-next-line: forin
    partnerRequest.partnerId = selectedProfile.partnerId;
    partnerRequest.profileName = selectedProfile.profileName;
    partnerRequest.createdDate = selectedProfile.slectedDate;
    // tslint:disable-next-line: radix
    partnerRequest.preOnBoardScore = selectedProfile.preOnBoardScore ? parseInt(selectedProfile.preOnBoardScore) : null;
    // tslint:disable-next-line: radix
    partnerRequest.postOnBoardScore = selectedProfile.postOnBoardScore ? parseInt(selectedProfile.postOnBoardScore) : null;
    partnerRequest.status = selectedProfile.status;
    partnerRequest.blockChainStatus = selectedProfile.blockChainStatus;
    partnerRequest.infoData = [];
    partnerRequest.workStepTeam = selectedProfile.workStepTeam;
    partnerRequest.wfProcessInstanceId = selectedProfile.wfProcessInstanceId;
    partnerRequest.statusInWorkStepTeam = selectedProfile.statusInWorkStepTeam;
    return partnerRequest;
  }

  getConfiguration(value: any): any {
    return this.pmService.getprofileinfos(value);
  }

  updatePartner(partnerId: any, partnerRequest: PartnerInfo): Observable<any> {
    let userName = this.appService.logindetails && this.appService.logindetails['usrName'] ? this.appService.logindetails['usrName'] : '';
    //userName = 'partnermanageruser';
    return this.pmService.updatepartnerInfoEntity(partnerId, partnerRequest, userName);
  }

  saveChecklistData(checkedDataName: string, workStepTeam: any, checkedValue: boolean, partnerValue: any) {
    const cehcklistObj =  {
      teamName : workStepTeam,
      toDos: checkedDataName,
      partnerId: partnerValue,
      checkFlag: checkedValue
    };
    return this.pmService.createCheckListData(cehcklistObj);
  }

  getCheckListdetails() {
    return this.dataService.externalGet(API.getConfigureKPIJson);
  }

  getCheckListFromDB(teamName: string, partnerId: any) {
    return this.pmService.getCheckListData(partnerId, teamName);
  }
}
