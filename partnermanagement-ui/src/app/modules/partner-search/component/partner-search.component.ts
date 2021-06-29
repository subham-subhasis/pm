import { Component, OnInit, OnDestroy, ViewEncapsulation, HostListener, ViewChildren, ViewChild } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormGroup } from '@angular/forms';
import { PartnerSearchService } from '../service/partner-search.service';
import { CommonService } from 'src/app/common/services/common.service';
import { PartnerInfo, FilterMap } from 'partnermanagement-api';
import { customMessages } from 'src/app/common/utility/constants';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';
import { PanelDataViewComponent } from 'src/app/modules/subex-panel-data/panel-data-view/panel-data-view.component';
import { SearchResultsViewComponent } from 'src/app/modules/subex-panel-data/search-results-view/search-results-view.component';
import { BlockchainOrganisationRegisterComponent } from '../../blockchain-organisation-register/blockchain-organisation-register.component';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-partner-search',
  templateUrl: './partner-search.component.html',
  styleUrls: ['./partner-search.component.scss'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ height: 0, opacity: 0 }),
            animate('500ms ease-out')
          ]
        ),
        transition(
          ':leave',
          [
            animate('200ms ease-in', style({ height: 0, opacity: 0 }))
          ]
        )
      ]
    )
  ]
})

export class PartnerSearchComponent implements OnInit, OnDestroy {
  static count = 0;
  canLoad = false;
  pendingLoad = false;
  loader = false;
  pageloader = false;

  jsonData: any = [];
  formGrpMapKeys = [];
  profileData = [];
  panelDataView = {} as any;
  confirmDialoge = { status: false, message: '', objToFetch: {} };
  formData: any = { accessPartitons:[], totalCountPartners: 0, totalCountPages: 0, allStatus: [], allProfileData: [], allProfileDataBackUp: [], filterAction: false, selectedCard: 0, editKPI: true, rightPartnerId: 0, searchText: '', planSelected: [], searchTextFilter: '' };
  filterData: any = { aplliedFilter: false, allProfiles: [], allProfilesBackup: [], from: '', to: '', searchProfileType: '', profilesSelected: [], statusSelected: {}, status: [{ active: false }, { underconsideration: false }, { preactive: false }, { rejected: false }], rangeValuesPreBoarding: [1, 10], rangeValuesPostBoarding: [1, 10] };
  chipSelected = { 'all': true, 'preactive': false, 'active': false, 'rejected': false, 'underconsideration': false };
  selectedProfile = { profileName: '', slectedDate: '', status: 'preactive', backupStatus: 'preactive', preOnBoardScore: '', postOnBoardScore: '', blockChainStatus: '', companyName: '', workStepTeam: '', statusInWorkStepTeam: '', wfProcessInstanceId: 0 };
  panelData: any = { isPanelDataIntegration: false, panelDataOpenSatate: false, matchFound: false, backupPanelDataView: {} };
  blockchainData: any = { isBLockchainIntegration: true, type: 'NEW', blockchainPopUpOpenState: false, };
  formGrpMap: { [key: string]: { controls: FormGroup, config: any, definitionIds: any } } = {};
  infiniteScroll = { initialPage: 0 };
  screenActions = {} as any;

  saveSubscription: Subscription;
  profileDataSubscription: Subscription;
  refershAllDataDataSubscription: Subscription;
  leftprofileDataSubscription: Subscription;
  getProspectProfileDataSubscription: Subscription;
  fetchAllProfileTypeSubscription: Subscription;
  getBlockchainDataSubscription: Subscription;
  searchFilterDataSubscription: Subscription;

  constructor(private commonService: CommonService,
              private appService: AppService,
              private partnerSearchService: PartnerSearchService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.commonService.hideToaster();
    this.screenActions = this.commonService.getScreenActions('Partner Search');
    this.getJsonData();
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

  onModalClick(event: any) {
    if (event.status === 'close') {
      this.confirmDialoge.status = false;
    } else if (event.status === 'yes') {
      this.confirmDialoge.status = false;
      if (event.objeToRetrieve.cardSelect) {
        this.onProfileSelection(event.objeToRetrieve.id);
        this.formData.selectedCard = event.objeToRetrieve.col;
      } else if (event.objeToRetrieve.statusSelect) {
        this.cancelFilter();
        this.formData.editKPI = true;
        this.onUpForntStatusChange(event.objeToRetrieve.status);
      }
    }
  }

  confirmToChangePartnerDetails(id: any, col: number) {
    if (!this.formData.editKPI) {
      this.confirmDialoge.status = true;
      const cardSelect = true;
      this.confirmDialoge.objToFetch = { id, col, cardSelect };
    } else {
      this.onProfileSelection(id);
      this.formData.selectedCard = col;
    }
  }

  isEmptyObject(obj: any) {
    return Object.keys(obj).length === 0;
  }

  onScrollDown() {
    const filterProfile = [];
    const filterStatus = [];
    if ( this.canLoad && this.formData.allProfileData.length < this.formData.totalCountPartners) {
      if (this.filterData.aplliedFilter) {
        for (const status in this.filterData.statusSelected) {
          if (this.filterData.statusSelected[status]) {
            filterStatus.push(status);
          }
        }
        for (const profile of this.filterData.allProfiles) {
          if (profile.selected) {
            filterProfile.push(profile.profileName);
          }
        }
      }
      if(filterProfile.length === 0) {
        for (const profile of this.filterData.allProfiles) {
          filterProfile.push(profile.profileName);
        }
      }
      this.canLoad = false;
      this.pendingLoad = false;
      this.leftprofileDataSubscription && this.leftprofileDataSubscription.unsubscribe();
      this.getPartnerInfoData(-1, true, PartnerSearchComponent.count, PartnerSearchComponent.count + 10, filterProfile, filterStatus, this.filterData.from, this.filterData.to );
    } else {
      this.pendingLoad = true;
    }
  }

  onUpForntStatusChange(status: string) {
    if (!this.formData.editKPI) {
      this.confirmDialoge.status = true;
      const statusSelect = true;
      this.confirmDialoge.objToFetch = { status, statusSelect };
    } else {
      this.filterData.statusSelected[status] = true;
      for (const val in this.filterData.statusSelected) {
        if(val.toString() === status.toString()) {
          this.filterData.statusSelected[status] = true;
        } else {
          delete  this.filterData.statusSelected[val];
        }
      }
      this.chipSelect(status);
      this.applyFilterDB();
    }
  }

  chipSelect(status: string) {
    this.formData.searchText = '';
    switch(status.toLowerCase()){
      case 'all': this.chipSelected.all = true,
                  this.chipSelected.active = false,
                  this.chipSelected.preactive = false,
                  this.chipSelected.rejected = false,
                  this.chipSelected.underconsideration = false;
                  break;
      case 'active': this.chipSelected.all = false,
                  this.chipSelected.active = true,
                  this.chipSelected.preactive = false,
                  this.chipSelected.rejected = false,
                  this.chipSelected.underconsideration = false;
                  break;
      case 'preactive': this.chipSelected.all = false,
                  this.chipSelected.active = false,
                  this.chipSelected.preactive = true,
                  this.chipSelected.rejected = false,
                  this.chipSelected.underconsideration = false;
                  break;
      case 'rejected': this.chipSelected.all = false,
                  this.chipSelected.active = false,
                  this.chipSelected.preactive = false,
                  this.chipSelected.rejected = true,
                  this.chipSelected.underconsideration = false;
                  break;
      case 'underconsideration': this.chipSelected.all = false,
                  this.chipSelected.active = false,
                  this.chipSelected.preactive = false,
                  this.chipSelected.rejected = false,
                  this.chipSelected.underconsideration = true;
                  break;
    }
  }

  clearUpForntStatus() {
    this.filterData.statusSelected = {};
    this.chipSelect('all');
    this.applyFilterDB();
  }

  refreshPartnerData() {
    this.onProfileSelection(this.formData.rightPartnerId);
  }

  cancelEdit() {
    this.formData.editKPI = true;
    for (const property in this.formGrpMap) {
      this.partnerSearchService.addDisable(this.formGrpMap[property].controls.controls);
    }
  }

  changeFilter() {
    this.formData.filterAction = !this.formData.filterAction;
  }

  cancelFilter() {
    this.filterData.aplliedFilter = false;
    this.formData.searchTextFilter = '';
    this.searchProfile('');
    this.filterData.allProfiles = this.filterData.allProfiles.map(val => {
      return {
        ...val,
        ['selected']: false
      };
    });
    this.filterData.allProfilesBackup = [...this.filterData.allProfiles];
    this.formData.allProfileData = [...this.formData.allProfileDataBackUp];
    this.filterData.from = '';
    this.filterData.to = '';
    this.filterData.searchProfileType = '';
    this.filterData.statusSelected = {};
    this.filterData.status = [{ active: false }, { underconsideration: false }, { preactive: false }, { rejected: false }];
    this.filterData.rangeValuesPreBoarding = [1, 10];
    this.filterData.rangeValuesPostBoarding = [1, 10];
  }

  selectFirstCard() {
    if (this.formData.allProfileData && this.formData.allProfileData.length > 0) {
      const maxPartnerId = this.partnerSearchService.setProfileInitial(this.formData.allProfileData);
      this.onProfileSelection(maxPartnerId);
      this.formData.selectedCard = 0;
    } else {
      this.formData.selectedCard = -1;
    }
  }

  searchProfile(textEntered: any) {
    this.filterData.allProfiles = this.filterData.allProfilesBackup.filter(item => {
      if (item && item.profileName.toLowerCase().indexOf(textEntered.toLowerCase()) > -1) {
        return true;
      }
      return false;
    });
  }

  changeFilterCheckBoxVal(obj: any) {
    for (let i = 0; i < this.filterData.allProfiles.length; i++) {
      if (this.filterData.allProfiles[i].profileName === obj.profileName) {
        this.filterData.allProfiles[i].selected = obj.selected;
      }
    }
  }

  eidtKPI() {
    this.formData.editKPI = false;
    // tslint:disable-next-line: forin
    for (const property in this.formGrpMap) {
      this.partnerSearchService.removeDisable(this.formGrpMap[property].controls.controls);
    }
  }

  createFormGroups() {
    if (this.profileData && this.profileData.length) {
      this.formGrpMap = {};
      this.profileData.forEach(groupItem => {
        if (groupItem && groupItem.fieldGroup && groupItem.fieldGroup.fieldGrpName && !this.formGrpMap[groupItem.fieldGroup.fieldGrpName]) {
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName] = {} as any;
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerSearchService.getGroupsFormControls(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerSearchService.getGroupsFormConfig(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerSearchService.getDefinitionsIds(groupItem.definitions);
        } else {
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerSearchService.getGroupsFormControls(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerSearchService.getGroupsFormConfig(groupItem.definitions);
          this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerSearchService.getDefinitionsIds(groupItem.definitions);
        }
      });
    }
  }

  bindDataRightField(id: number) {
    this.formData.planSelected = '';
    const selectedLeftProfile = this.formData.allProfileData.filter(val => val.partnerId === id)[0];
    this.formData.rightPartnerId = id;
    let mapSelectedVal = this.partnerSearchService.formSelectedMap(selectedLeftProfile, this.formGrpMap);
    this.profileData.forEach(groupItem => {
      if (groupItem && groupItem.fieldGroup && groupItem.fieldGroup.fieldGrpName && !this.formGrpMap[groupItem.fieldGroup.fieldGrpName]) {
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName] = {} as any;
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerSearchService.getGroupsFormControls(groupItem.definitions);
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerSearchService.getGroupsFormConfig(groupItem.definitions);
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerSearchService.getDefinitionsIds(groupItem.definitions);
      } else {
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].controls = this.partnerSearchService.getGroupsFormControls(groupItem.definitions);
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config = this.partnerSearchService.getGroupsFormConfig(groupItem.definitions);
        this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds = this.partnerSearchService.getDefinitionsIds(groupItem.definitions);
      }
      mapSelectedVal = this.partnerSearchService.getBase64url(this.formGrpMap[groupItem.fieldGroup.fieldGrpName].config, this.formGrpMap[groupItem.fieldGroup.fieldGrpName].definitionIds, mapSelectedVal);
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
      this.formGrpMap[grp].controls.controls[item].disable(this.formData.editKPI);
    });
  }

  applyFilterDB() {
    this.filterData.aplliedFilter = true;
    PartnerSearchComponent.count = 0;
    const filterProfile = [];
    const filterStatus = [];
    this.formData.allProfileData = [];
    this.formData.allProfileDataBackUp = [];
    this.formData.searchTextFilter = '';
    this.searchProfile('');
    for (const status in this.filterData.statusSelected) {
      if (this.filterData.statusSelected[status]) {
        filterStatus.push(status);
      }
    }
    for (const profile of this.filterData.allProfiles) {
      if (profile.selected) {
        filterProfile.push(profile.profileName);
      }
    }
    if(filterProfile.length === 0) {
      for (const profile of this.filterData.allProfiles) {
        filterProfile.push(profile.profileName);
      }
    }
    this.getPartnerInfoData(-1, true, PartnerSearchComponent.count, PartnerSearchComponent.count + 10, filterProfile, filterStatus, this.filterData.from, this.filterData.to );
  }

  searchParticularCompany(compName: string) {
    if(compName && compName.length > 0) {
      const jsonLabels = this.partnerSearchService.getLabels();
      const companyLabel = jsonLabels.companyName;
      const filterMap: FilterMap = {filterKey: companyLabel, filterValue: compName}
      PartnerSearchComponent.count = 0;
      this.getPartnerInfoData(-1, false, PartnerSearchComponent.count, PartnerSearchComponent.count + 10, [], [], '', '', [filterMap] );
    }
  }

  getPartitonedProfiles() {
    let partitonNames = [];
    if (this.appService.logindetails && this.appService.logindetails.properties && this.appService.logindetails.properties.rolePartitionsNames) {
      if (this.appService.logindetails.properties.rolePartitionsNames.length === 1 &&
        this.appService.logindetails.properties.rolePartitionsNames[0].ptnName.toLowerCase() === 'common') {
        partitonNames = [];
        this.getAllProfiles();
      } else {
        this.appService.logindetails.properties.rolePartitionsNames.forEach(partiton => {
          if (partiton && partiton.ptnName.toLowerCase() !== 'common') {
            partitonNames.push(partiton.ptnName);
          }
        });
        this.filterData.allProfiles = partitonNames.map(val => {
          return {
            ['profileName']: val,
            ['selected']: false
          };
        });
        this.filterData.allProfilesBackup = [...this.filterData.allProfiles];
      }
      this.canLoad = true;
    }
    this.getPartnerInfoData(-1, false, PartnerSearchComponent.count, PartnerSearchComponent.count + 10, partitonNames, [], '', '');
  }

  getAllProfiles() {
    this.fetchAllProfileTypeSubscription = this.partnerSearchService.getProfiles().subscribe((resp: any) => {
      this.filterData.allProfiles = resp;
      this.filterData.allProfiles = this.filterData.allProfiles.map(val => {
         return {
          ...val,
          ['selected']: false
        };
      });
      this.filterData.allProfilesBackup = [...this.filterData.allProfiles];
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  getPartnerInfoData(partnerId: number, isScrolled: boolean, initialPage: number, lastPage: number,  filterProfile: Array<string>, filterStatus: Array<string>, filterCreatedFromDate: string, filterCreatedToDate: string, filterMap?: FilterMap[]) {
    this.leftprofileDataSubscription = this.partnerSearchService.getLeftSideConfigurationData(initialPage, lastPage, filterProfile, filterStatus, filterCreatedFromDate, filterCreatedToDate, filterMap).subscribe((resp: any) => {
      if (resp && resp.totalPartners) {
        this.formData.totalCountPartners = resp.totalPartners;
        this.formData.totalCountPages = resp.totalPages;
        const retArr = this.partnerSearchService.configureProfileData(resp.partnerInfos);
        if (isScrolled) {
          this.formData.allProfileData = this.formData.allProfileData.concat(retArr);
          this.formData.allProfileDataBackUp = this.formData.allProfileDataBackUp.concat(retArr);
          this.canLoad = true;
        } else {
          this.formData.allProfileData = retArr;
          this.formData.allProfileDataBackUp = retArr;
        }
        PartnerSearchComponent.count += 10;
        this.mainLoader(false);
        if (resp.partnerInfos && resp.partnerInfos.length > 0) {
          if (partnerId === -1) {
            this.selectFirstCard();
          } else {
            this.onProfileSelection(partnerId);
          }
        } else {
          this.progressLoader(false);
        }
      } else {
          this.mainLoader(false);
          this.formData.selectedCard = -1;
          this.commonService.showWarningToaster(customMessages.partnerSearch.noPartnersFound);
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  refreshParticularProfile(partnerId: number) {
    this.refershAllDataDataSubscription = this.partnerSearchService.getSinglePartnerInfoByPartnerId(partnerId).subscribe((resp: any) => {
      if(resp) {
        const retArr = this.partnerSearchService.configureProfileData([resp]);
        for(const profilePosition in this.formData.allProfileData) {
          if(this.formData.allProfileData[profilePosition].partnerId === partnerId) {
            this.formData.allProfileData[profilePosition] = retArr[0];
          }
        }
        for(const profilePosition in this.formData.allProfileDataBackUp) {
          if(this.formData.allProfileDataBackUp[profilePosition].partnerId === partnerId) {
            this.formData.allProfileDataBackUp[profilePosition] = retArr[0];
          }
        }
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.progressLoader(false);
      });
  }

  getJsonData() {
    this.jsonData = this.commonService.getJSONData();
    this.partnerSearchService.setLabels(this.jsonData);
    this.blockchainData.isBLockchainIntegration = this.jsonData[0].isBLockchainIntegration;
    this.mainLoader(true);
    this.getPartitonedProfiles();
  }

  bindStatusForProfile(status: any) {
    if (status) {
      if (this.jsonData && this.jsonData.length > 0) {
        const filteredStatusFromJson = this.jsonData[0].partnerSearch.status.filter(val => val.statusId === status);
        if (filteredStatusFromJson && filteredStatusFromJson.length > 0) {
          this.formData.allStatus = filteredStatusFromJson[0].statusToShow;
          this.selectedProfile.status = status;
          this.selectedProfile.backupStatus = status;
        }
      }
    } else {
      this.selectedProfile.status = 'preactive';
    }
  }

  onProfileSelection(id) {
    this.formGrpMap = {};
    this.formData.editKPI = true;
    this.selectedProfile = this.partnerSearchService.bindSelectedProfileData(id, this.selectedProfile, this.formData.allProfileData);
    this.bindStatusForProfile(this.selectedProfile.status);
    this.progressLoader(true);
    this.profileDataSubscription = this.partnerSearchService.getConfiguration(this.selectedProfile.profileName).subscribe((resp: any) => {
      if (resp && resp.length && resp[0].profileName === this.selectedProfile.profileName) {
        this.checkForProspectProfile(id, this.selectedProfile.companyName);
        this.profileData = resp[0].profileData;
        this.profileData.sort((a, b) => {
          return a.groupOrder - b.groupOrder;
        });
        this.createFormGroups();
        this.formGrpMapKeys = Object.keys(this.formGrpMap);
      }
      this.bindDataRightField(id);
    }, err => {
      this.commonService.showErrorToaster(customMessages.errorMessage);
      this.progressLoader(false);
    });
  }

  checkForProspectProfile(id: any, companyName: string) {
    if (this.jsonData && this.jsonData.length > 0) {
      this.panelData.isPanelDataIntegration = this.jsonData[0].isPanelDataIntegration;
      if (this.panelData.isPanelDataIntegration) {
        this.getProspectProfileData(id, companyName);
      } else {
        this.progressLoader(false);
      }
    }
  }

  onSave() {
    let isValid = true;
    const partnerRequest: PartnerInfo = this.partnerSearchService.partnerReuqestPutObject(this.selectedProfile);
    // tslint:disable-next-line: forin
    for (const key in this.formGrpMap) {
      const group = this.formGrpMap[key];
      this.partnerSearchService.validateAllFormFields(group.controls);
      if (group.controls.status === 'INVALID') {
        isValid = false;
      }
      const mappedArray = this.partnerSearchService.mapFormGroupToCreatePartnerRequest(group.controls.getRawValue(), group.definitionIds);
      partnerRequest.infoData = [...partnerRequest.infoData, ...mappedArray];
    }
    if (isValid) {
      this.progressLoader(true), this.saveSubscription = this.partnerSearchService.updatePartner(this.formData.rightPartnerId, partnerRequest).subscribe(resp => {
        this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
        //this.refreshParticularProfile(this.formData.rightPartnerId); //to refresh particular Profile
        this.cancelEdit();
        this.bindStatusForProfile(this.selectedProfile.status);
        this.onUpForntStatusChange(this.selectedProfile.status); // refersh all fo that profile
        if (this.selectedProfile.status === 'underconsideration' && this.selectedProfile.workStepTeam !== 'PM Admin') {
          if (this.selectedProfile.wfProcessInstanceId  === null) {
            this.selectedProfile.workStepTeam = 'PM Admin';
          }
        }
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

  getProspectProfileData(id: any, companyName: any) {
    if (companyName) {
      this.panelDataView = {};
      this.panelData.backupPanelDataView = {};
      this.getProspectProfileDataSubscription = this.partnerSearchService.getProspectProfileData(companyName).subscribe((data: any) => {
        if (data && data.length > 0 ) {
          this.panelDataView = this.partnerSearchService.formPanelDataObject(id, this.panelDataView, this.formData.allProfileData);
          this.panelDataView['panelDataContent'] = data;
          this.panelData.backupPanelDataView = {...this.panelDataView};
          if (this.checkMatchFoundForPanelData(data)) {
            this.panelData.matchFound = true;
          } else {
            this.panelData.matchFound = false;
          }
        } else {
          this.panelData.matchFound = false;
        }
        this.progressLoader(false);
      },
        err => {
          this.panelData.matchFound = false;
          this.progressLoader(false);
        });
    }
  }

  checkMatchFoundForPanelData(data: any): boolean {
    let found = false;
    if ( data === undefined || data && data.length === 0 ) {
      found = false;
    } else {
      let isExactMatch = true;
      data.forEach(source => {
        if (!source.isExactMatch) { isExactMatch = false; return; }
      });
      isExactMatch && (found = true);
    }
    return found;
  }

  onProspectPreviewMatchFound() {
    this.linkMatchedProspectProfile(false);
  }

  linkMatchedProspectProfile(showLinkButton: boolean) {
    const selectedProfileForPanelData = this.panelDataView;
    const dialogRef = this.dialog.open(PanelDataViewComponent, {
      data: { selectedProfileForPanelData, showLinkButton },
      width: '45vw',
      height: '100vh',
      maxWidth: '45vw',
      maxHeight: '100vh',
      backdropClass: 'backdropBackground',
      disableClose: true
    });
    this.panelData.panelDataOpenSatate = true;
    dialogRef.updatePosition({ top: '50px', right: '0px' });
    dialogRef.afterClosed().subscribe(result => {
      this.panelData.panelDataOpenSatate = false;
      if (result.data.onlinkProfileClick) {
        const objkpiDataMap = this.partnerSearchService.formPanelDataObjectOnlink(result.data.allsourcesData);
        const grpArr = Object.keys(this.formGrpMap);
        grpArr.forEach(grp => {
          const arrFormControls = Object.keys(this.formGrpMap[grp].controls.controls);
          if ( arrFormControls && arrFormControls.length > 0 ) {
            arrFormControls.forEach(kpiName => {
              if (objkpiDataMap && Object.keys(objkpiDataMap).includes(kpiName)) {
                const retArrValues = this.commonService.findFieldIndex(this.formGrpMap[grp].config, kpiName, 'name');
                this.formGrpMap[grp].controls.controls[kpiName].setValue(this.partnerSearchService.bindFormControlOnLink(kpiName, retArrValues, objkpiDataMap));
              }
            });
          }
        });
      }
    });
  }

  onProspectPreviewMatchNotFound() {
    this.createNewProspectProfile(false);
  }

  createNewProspectProfile(showLinkButton: boolean) {
    let listSourceData = {};
    let panelDataContent = [];
    if (Object.keys(this.panelData.backupPanelDataView).length !== 0) {
      panelDataContent = [...this.panelData.backupPanelDataView.panelDataContent];
    }
    if (panelDataContent && panelDataContent.length > 0) {
      // tslint:disable-next-line: no-shadowed-variable
      const arrayToObject = (panelDataContent: any[]) =>
      panelDataContent.reduce((obj, item) => {
        obj[item.source] = { profiles: this.partnerSearchService.formatProfiles(item.profiles, item.isExactMatch) };
        return obj;
      }, {});
      listSourceData =  arrayToObject(panelDataContent);
    } else  {
      listSourceData =  {};
    }
    // tslint:disable-next-line: no-shadowed-variable
    const dialogRef = this.dialog.open(SearchResultsViewComponent, {
      data: { listSourceData, selectedProfileForPanelData: this.panelData.backupPanelDataView },
      width: '40vw',
      height: '100vh',
      // maxWidth: '30vw',
      maxHeight: '100vh',
      backdropClass: 'backdropBackground',
      disableClose: true
    });
    this.panelData.panelDataOpenSatate = true;
    dialogRef.updatePosition({ top: '50px', right: '0px' });

    dialogRef.afterClosed().subscribe(result => {
      this.panelData.panelDataOpenSatate = false;
      if (result.data.fetchProfile) {
        this.panelDataView['panelDataContent'] = result.data.arrsSlectedProfileForPanelData;
        this.linkMatchedProspectProfile(showLinkButton);
      }
    });
  }

  onBlockChainRegisterPopUp(type: string, blockchainData: any) {
    let dataToSend = {};
    if ( type.toLowerCase() === 'new') {
      dataToSend = { type, partnerName: this.selectedProfile.companyName ? this.selectedProfile.companyName : '', partnerId: this.formData.rightPartnerId };
    } else if ( type.toLowerCase() === 'update') {
      dataToSend = { type, partnerName: this.selectedProfile.companyName ? this.selectedProfile.companyName : '', partnerId: this.formData.rightPartnerId, blockchainData };
    }
    this.blockchainData.blockchainPopUpOpenState = true;
    const dialogRef = this.dialog.open(BlockchainOrganisationRegisterComponent, {
      data: dataToSend,
      width: '70vw',
      height: '70vh',
      backdropClass: 'backdropBackground',
      disableClose: true,
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(result => {
      this.blockchainData.blockchainPopUpOpenState = false;
      if (result.data.saveSuccessful ) {
        this.getPartnerInfoData(this.formData.rightPartnerId, false, 0, 0, [], [], '', '');
      }
    });
  }

  getBlockchainDataByProfileId(id: any) {
    if (this.jsonData && this.jsonData.length > 0) {
      this.blockchainData.isBLockchainIntegration = this.jsonData[0].isBLockchainIntegration;
      this.progressLoader(true);
      if (this.blockchainData.isBLockchainIntegration) {
        this.getBlockchainDataSubscription = this.partnerSearchService.getBLockchainDetails(id).subscribe((data: any) => {
          if (data) {
            this.blockchainData.type = 'UPDATE';
          } else {
            this.blockchainData.type = 'NEW';
          }
          this.onBlockChainRegisterPopUp(this.blockchainData.type, data);
          this.progressLoader(false);
        },
          err => {
            this.progressLoader(false);
          });
      }
    }
  }

  ngOnDestroy() {
    PartnerSearchComponent.count = 0;
    this.commonService.hideToaster();
    this.saveSubscription && this.saveSubscription.unsubscribe();
    this.profileDataSubscription && this.profileDataSubscription.unsubscribe();
    this.refershAllDataDataSubscription && this.refershAllDataDataSubscription.unsubscribe();
    this.leftprofileDataSubscription && this.leftprofileDataSubscription.unsubscribe();
    this.getProspectProfileDataSubscription && this.getProspectProfileDataSubscription.unsubscribe();
    this.getBlockchainDataSubscription && this.getBlockchainDataSubscription.unsubscribe();
    this.fetchAllProfileTypeSubscription  && this.fetchAllProfileTypeSubscription.unsubscribe();
    this.searchFilterDataSubscription && this.searchFilterDataSubscription.unsubscribe();
  }
}
