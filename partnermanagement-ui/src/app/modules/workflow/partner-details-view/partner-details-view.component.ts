import { Component, OnInit, Inject, ViewEncapsulation, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Subscription } from 'rxjs';
import { PartnerDeatilsViewService } from './service/partner-deatils-view.service';
import { FormGroup } from '@angular/forms';
import { CommonService } from 'src/app/common/services/common.service';
import { customMessages } from 'src/app/common/utility/constants';
import { PartnerInfo } from 'partnermanagement-api';
import { WorkflowViewService } from '../workflow-view/service/workflow-view.service';

@Component({
  selector: 'app-partner-details-view',
  templateUrl: './partner-details-view.component.html',
  styleUrls: ['./partner-details-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PartnerDetailsViewComponent implements OnInit, OnDestroy {

  loader = false;
  pageloader = false;
  formGrpMap: { [key: string]: { controls: FormGroup, config: any, definitionIds: any } } = {};
  formGrpMapKeys = [];
  formData = { partnerId: -1, editKPI: false, checklistData: [] };
  confirmDialoge = { status: false, message: '', objToFetch: {} };
  moveBackDialouge = { status: false, header: '', objToFetch: {} };
  selectedProfile = {} as any;
  profileData = [];

  profileDataSubscription: Subscription;
  updatePartnerDataSubscription: Subscription;
  approveSubscription: Subscription;
  requestForMoreInfoSubscription: Subscription;
  rejectSubscription: Subscription;
  checklistConfigurationSubscription: Subscription;
  checklistConfigurationfromDBSubscription: Subscription;
  saveChecklistDataSubscription: Subscription;

  constructor(public dialogRef: MatDialogRef<PartnerDetailsViewComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              private partnerDataService: PartnerDeatilsViewService,
              private commonService: CommonService,
              private workflowViewService: WorkflowViewService) { }

  ngOnInit() {
    this.confirmDialoge.message = customMessages.workflow.alertMessageApproveonButtonClick;
    this.mainLoader(true);
    this.selectedProfile = this.partnerDataService.bindSelectedProfileData(this.selectedProfile, this.data.partnerData);
    this.getPartnerData();
    this.getCheckListdetailsFromJSON(this.selectedProfile.workStepTeam);
  }

  progressLoader(status: boolean) {
    status ? (this.loader = status) : setTimeout(() => {
      this.loader = status;
    }, 500);
  }

  mainLoader(status: boolean) {
    status ? (this.pageloader = status) : setTimeout(() => {
      this.pageloader = status;
    }, 500);
  }

  createFormGroups() {
    if (this.profileData && this.profileData.length) {
      this.formGrpMap = {};
      this.profileData.forEach(groupItem => {
        if (groupItem && groupItem.fieldGroup && groupItem.fieldGroup.fieldGrpName && !this.formGrpMap[groupItem.fieldGroup.fieldGrpName]) {
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName] = {} as any;
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerDataService.getGroupsFormControls(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerDataService.getGroupsFormConfig(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerDataService.getDefinitionsIds(groupItem.definitions);
        } else {
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerDataService.getGroupsFormControls(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerDataService.getGroupsFormConfig(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerDataService.getDefinitionsIds(groupItem.definitions);
        }
      });
    }
  }

  bindDataRightField(selectedProfile: any) {
    let mapSelectedVal = this.partnerDataService.formSelectedMap(selectedProfile, this.formGrpMap);
    this.profileData.forEach(groupItem => {
      mapSelectedVal = this.partnerDataService.getBase64url(this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config, this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds, mapSelectedVal);
    });
    const grpArr = Object.keys(this.formGrpMap);
    grpArr.forEach(grp => {
      const arrFormControls = Object.keys(this.formGrpMap[grp].controls.controls);
      this.bindData(arrFormControls, grp, mapSelectedVal, this.formGrpMap[grp].definitionIds);
    });
  }

  bindData(arrFormControls: any, grp: any, mapSelectedVal: any, definitonIds: any) {
    arrFormControls.forEach(item => {
      this.formGrpMap[grp].controls.controls[item].setValue(mapSelectedVal[definitonIds[item]]);
      this.formGrpMap[grp].controls.controls[item].disable();
    });
  }

  editPartnerData() {
    this.formData.editKPI = true;
    // tslint:disable-next-line: forin
    for (const property in this.formGrpMap) {
      this.partnerDataService.removeDisable(this.formGrpMap[property].controls.controls);
    }
  }

  cancelEditPartnerData() {
    this.formData.editKPI = false;
    // tslint:disable-next-line: forin
    for (const property in this.formGrpMap) {
      this.partnerDataService.addDisable(this.formGrpMap[property].controls.controls);
    }
  }

  onNoClick(): void {
    this.dialogRef.close({ data: { type: 'refresh' } });
  }

  moveNextTeam() {
    this.confirmDialoge.status = true;
    this.confirmDialoge.objToFetch = {};
    const moveNextTeamFlag = true;
    this.confirmDialoge.objToFetch = { moveNextTeamFlag };
  }

  moveBackToTeam() {
    this.moveBackDialouge.status = true;
    this.moveBackDialouge.header = customMessages.workflow.modalHeaderOnMoveBack;
    this.moveBackDialouge.objToFetch = {};
    const moveBackToTeamFlag = true;
    this.moveBackDialouge.objToFetch = { moveBackToTeamFlag };
  }

  requestAdditionalInfo() {
    this.moveBackDialouge.status = true;
    this.moveBackDialouge.header = customMessages.workflow.requestForMoreInfo;
    this.moveBackDialouge.objToFetch = {};
    const requestAdditionalInfoFlag = true;
    this.moveBackDialouge.objToFetch = { requestAdditionalInfoFlag };
  }

  getPartnerData() {
    this.profileDataSubscription = this.partnerDataService.getConfiguration(this.selectedProfile['profileName']).subscribe((resp: any) => {
      if (resp && resp.length && resp[0].profileName === this.selectedProfile['profileName']) {
        this.profileData = resp[0].profileData;
        this.profileData.sort((a, b) => {
          return a.groupOrder - b.groupOrder;
        });
        this.createFormGroups();
        this.formGrpMapKeys = Object.keys(this.formGrpMap);
      }
      this.mainLoader(false);
      this.bindDataRightField(this.selectedProfile);
    }, err => {
      this.commonService.showErrorToaster(customMessages.errorMessage);
      this.mainLoader(false);
    });
  }

  onApprove(event: any) {
    if (event.status === 'close') {
      this.confirmDialoge.status = false;
    } else if (event.status === 'yes') {
      this.confirmDialoge.status = false;
      this.mainLoader(true);
      this.approveSubscription = this.workflowViewService.approveUser(this.selectedProfile, this.selectedProfile.onApproveEmailBody).subscribe((data: any) => {
        this.mainLoader(false);
        if (data) {
          this.onNoClick();
        }
      },
        err => {
          this.commonService.showErrorToaster(customMessages.errorMessage);
          this.mainLoader(false);
        });
    }
  }

  onMoveBackOrPartnerCandidateClick(event: any) {
    if (event.status === 'close') {
      this.moveBackDialouge.status = false;
    } else if (event.status === 'pause') {
      this.moveBackDialouge.status = true;
    } else if (event.status === 'move') {
      this.moveBackDialouge.status = false;
      if (event.objeToRetrieve.moveBackToTeamFlag) {
        this.mainLoader(true), this.rejectSubscription = this.workflowViewService.rejectUser(this.selectedProfile, event.errorMessageForMovingback).subscribe((data: any) => {
          this.mainLoader(false);
          if (data) {
            this.onNoClick();
          }
        },
          err => {
            this.commonService.showErrorToaster(customMessages.errorMessage);
            this.mainLoader(false);
          });
      } else if (event.objeToRetrieve.requestAdditionalInfoFlag) {
        this.mainLoader(true), this.requestForMoreInfoSubscription = this.workflowViewService.requestForMoreInfo(this.selectedProfile, event.errorMessageForMovingback).subscribe((data: any) => {
          this.mainLoader(false);
          if (data) {
            this.onNoClick();
          }
        },
          err => {
            this.commonService.showErrorToaster(customMessages.errorMessage);
            this.mainLoader(false);
          });
      }
    }
  }

  onSave() {
    let isValid = true;
    const partnerRequest: PartnerInfo = this.partnerDataService.partnerReuqestPutObject(this.selectedProfile);
    // tslint:disable-next-line: forin
    for (const key in this.formGrpMap) {
      const group = this.formGrpMap[key];
      if (group.controls.status === 'INVALID') {
        isValid = false;
      }
      const mappedArray = this.partnerDataService.mapFormGroupToCreatePartnerRequest(group.controls.getRawValue(), group.definitionIds);
      partnerRequest.infoData = [...partnerRequest.infoData, ...mappedArray];
    }
    if (isValid) {
      this.progressLoader(true), this.updatePartnerDataSubscription = this.partnerDataService.updatePartner(partnerRequest.partnerId, partnerRequest).subscribe(resp => {
        this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
        this.cancelEditPartnerData();
        this.progressLoader(false);
      },
        err => {
          let errMsg = '';
          if (err.error && err.error.Status && err.error.Status.length > 0) {
            errMsg = customMessages.partnerSearch.updateFailed + err.error.Status;
            this.commonService.showErrorToaster(errMsg);
          } else {
            this.commonService.showErrorToaster(customMessages.errorMessage);
          }
          this.progressLoader(false);
        });
    } else {
      this.commonService.showErrorToaster(customMessages.manadateMessage);
    }
  }

  getCheckListdetailsFromDB() {
    this.progressLoader(true);
    this.checklistConfigurationfromDBSubscription = this.partnerDataService.getCheckListFromDB(this.selectedProfile.workStepTeam, this.selectedProfile.partnerId).subscribe((data: any) => {
      this.progressLoader(false);
      const objTeamCheckListMap = {};
      if (data && data.length > 0) {
        data.forEach(element => {
          objTeamCheckListMap[element.toDos] = element.checkFlag;
        });
        this.formData.checklistData.forEach(ckVal => {
          if (objTeamCheckListMap.hasOwnProperty(ckVal.displayName)) {
            ckVal.valueChecked = objTeamCheckListMap[ckVal.displayName];
          }
        });
      }
    },
      err => {
        this.progressLoader(false);
        this.commonService.showErrorToaster(customMessages.workflow.errorMessageCheckList);
      });
  }

  getCheckListdetailsFromJSON(workStepTeam: string) {
    this.checklistConfigurationSubscription = this.partnerDataService.getCheckListdetails().subscribe((data: any) => {
      if (data && data.length) {
        this.formData.checklistData = data[0].workflowCheckList[workStepTeam];
        this.getCheckListdetailsFromDB();
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.workflow.errorMessageCheckList);
      });
  }

  checklistDataChanged(checkedDataName: string, checkedValue: boolean) {
    this.progressLoader(true);
    this.saveChecklistDataSubscription = this.partnerDataService.saveChecklistData(checkedDataName, this.selectedProfile.workStepTeam, checkedValue, this.selectedProfile.partnerId).subscribe((data: any) => {
      if (data) {
        this.progressLoader(false);
      }
    },
      err => {
        this.progressLoader(false);
        this.commonService.showErrorToaster(customMessages.workflow.errorMessageCheckListsave);
      });
  }

  ngOnDestroy() {
    this.profileDataSubscription && this.profileDataSubscription.unsubscribe();
    this.updatePartnerDataSubscription && this.updatePartnerDataSubscription.unsubscribe();
    this.requestForMoreInfoSubscription && this.requestForMoreInfoSubscription.unsubscribe();
    this.rejectSubscription && this.rejectSubscription.unsubscribe();
    this.approveSubscription && this.approveSubscription.unsubscribe();
    this.checklistConfigurationSubscription && this.checklistConfigurationSubscription.unsubscribe();
    this.saveChecklistDataSubscription && this.saveChecklistDataSubscription.unsubscribe();
    this.checklistConfigurationfromDBSubscription && this.checklistConfigurationfromDBSubscription.unsubscribe();
  }
}
