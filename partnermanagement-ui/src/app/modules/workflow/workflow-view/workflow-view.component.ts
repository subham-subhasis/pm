import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { customMessages } from 'src/app/common/utility/constants';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/common/services/common.service';
import { WorkflowViewService } from './service/workflow-view.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material';
import { PartnerDetailsViewComponent } from '../partner-details-view/partner-details-view.component';

@Component({
  selector: 'app-workflow-view',
  templateUrl: './workflow-view.component.html',
  styleUrls: ['./workflow-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class WorkflowViewComponent implements OnInit, OnDestroy {
  formData = { onApproveEmailBody: '', currentTeam: '', currentTeamData: [], allPartnerData: [], allPartnerDataBackUp: [], searchTextForPartner: '' };
  jsonData = { workflowTeamsData: [] };
  confirmDialoge = { status: false, message: '', objToFetch: {} };
  moveBackDialouge = { status: false, header: '', objToFetch: {} };
  loader = false;
  pageloader = false;

  userRoleSubscription: Subscription;
  approveSubscription: Subscription;
  rejectSubscription: Subscription;
  requestMoreInfoSubscription: Subscription;
  paeLoadJSONDataSubscription: Subscription;
  partnerDataSubscription: Subscription;
  moveBackToMyBucketSubscription: Subscription;
  constructor(private commonService: CommonService,
              private workflowViewService: WorkflowViewService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.commonService.hideToaster();
    this.confirmDialoge.message = customMessages.workflow.alertMessgaeForAprove;
    this.pageLoadJSONData();
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

  drop(dropEvent: CdkDragDrop<string[]>, destIndex: number, destTeamName: string) {
    const srcIndex = dropEvent.previousContainer.element.nativeElement.parentElement.id;
    if (dropEvent.previousContainer === dropEvent.container) {
      moveItemInArray(dropEvent.container.data, dropEvent.previousIndex, dropEvent.currentIndex);
    } else {
      let cardDragDrop = true;
      let cardMoveBackToPartnerCandidate = false;
      let cardMoveBackDragDrop = false;
      if (destTeamName.toLowerCase() === customMessages.partnerCandidate) {
        this.moveBackDialouge.status = true;
        this.moveBackDialouge.header = customMessages.workflow.requestForMoreInfo;
        this.moveBackDialouge.objToFetch = {};
        cardMoveBackToPartnerCandidate = true;
        cardMoveBackDragDrop = false;
        cardDragDrop = true;
        this.moveBackDialouge.objToFetch = { dropEvent, cardMoveBackToPartnerCandidate };
      } else if (srcIndex && destIndex < parseInt(srcIndex, 10)) {
        if (destTeamName.toLowerCase() === customMessages.myBucket) {
          this.onMoveBackToMyBucket(dropEvent);
        } else  {
          this.moveBackDialouge.status = true;
          this.moveBackDialouge.header = customMessages.workflow.modalHeaderOnMoveBack;
          this.moveBackDialouge.objToFetch = {};
          cardMoveBackDragDrop = true;
          cardMoveBackToPartnerCandidate = false;
          cardDragDrop = true;
          this.moveBackDialouge.objToFetch = { dropEvent, cardMoveBackDragDrop };
        }
      } else {
        this.confirmDialoge.status = true;
        this.confirmDialoge.objToFetch = {};
        cardDragDrop = true;
        cardMoveBackToPartnerCandidate = false;
        cardMoveBackDragDrop = false;
        this.confirmDialoge.objToFetch = { dropEvent, cardDragDrop };
      }
    }
  }

  routeToDdetailsPage(partnerData: any, canEdit: boolean, teamPosition: any) {
    partnerData['canEdit'] = canEdit;
    partnerData['canMoveback'] = this.checkCanMoveback();
    partnerData['onApproveEmailBody'] = this.formData.onApproveEmailBody;
    this.commonService.hideToaster();
    const dialogRef = this.dialog.open(PartnerDetailsViewComponent, {
      data: { partnerData },
      width: '90vw',
      height: '98vh',
      maxWidth: '90vw',
      maxHeight: '98vh',
      backdropClass: 'backdropBackground',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getPartnersData(result.data.type);
    });
  }

  checkCanMoveback(): boolean {
    let moveBack = true;
    this.formData.currentTeamData.forEach(team => {
      if ((team.position && parseInt(team.position) === 0 && team.teamName.toLowerCase() === customMessages.myBucket) ||
          (team.position && parseInt(team.position) === 1 && team.teamName.toLowerCase() === customMessages.partnerCandidate)) {
        moveBack = false;
        return;
      }
    });
    return moveBack;
  }

  filterJSONDataByTeam(currentTeam: string) {
    if (currentTeam && this.jsonData.workflowTeamsData && this.jsonData.workflowTeamsData.length > 0) {
      // tslint:disable-next-line: no-unused-expression
      this.jsonData.workflowTeamsData.forEach(item => {
        if (item.teamName.toLowerCase() === currentTeam.toLowerCase()) {
          this.formData.currentTeamData = this.partnerCardToGroup(item.sequence);
          return;
        }
      });
    }
  }

  partnerCardToGroup(currentTeamData: any[]): any[] {
    currentTeamData = currentTeamData.map(val => {
      return {
        ...val,
        ['cardsForStatus']: this.getPartnersForAStatus(val.workStepTeam, val.statusInWorkStepTeam),
        ['teamName']: val.teamName
        //['totalTeam']: this.getPartnersForAStatus(val.workStepTeam, val.statusInWorkStepTeam).length
      };
    });
    return currentTeamData;
  }

  getPartnersForAStatus(workStepTeam: any, statusInWorkStepTeam: any): any[] {
    this.formData.allPartnerData = [...this.formData.allPartnerDataBackUp];
    const arr = [];
    for (let j = 0; j < this.formData.allPartnerData.length; j++) {
      if (this.formData.allPartnerData[j].workStepTeam && this.formData.allPartnerData[j].statusInWorkStepTeam &&
        (this.formData.allPartnerData[j].workStepTeam.toLowerCase() === workStepTeam.toLowerCase())
        && (this.formData.allPartnerData[j].statusInWorkStepTeam.toLowerCase() === statusInWorkStepTeam.toLowerCase())) {
        arr.push(this.formData.allPartnerData[j]);
      }
    }
    return arr;
  }

  pageLoadJSONData() {
    this.mainLoader(true), this.paeLoadJSONDataSubscription = this.workflowViewService.getConfigurationAPI().subscribe((data: any) => {
      if (data) {
        this.jsonData.workflowTeamsData = data[0].workflow.teams;
        this.formData.onApproveEmailBody = data[0].workflow.onApproveEmailBody;
        this.getTeamName();
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  getTeamName() {
    this.mainLoader(true), this.userRoleSubscription = this.workflowViewService.getUserdetails().subscribe((data: any) => {
      if (data) {
        this.workflowViewService.setUserDeatils(data);
        this.formData.currentTeam = data.teamName;
        this.getPartnersData('pageLoad');
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  getPartnersData(calledFor: string) {
    if (calledFor.toLowerCase() === 'refresh') {
      this.mainLoader(true);
    }
    this.partnerDataSubscription = this.workflowViewService.getPartnersData().subscribe((resp: any) => {
      this.mainLoader(false);
      if (resp && resp.length > 0) {
        const retArr = this.workflowViewService.configureProfileData(resp);
        this.formData.allPartnerData = retArr;
        this.formData.allPartnerDataBackUp = retArr;
        this.filterJSONDataByTeam(this.formData.currentTeam);
      } else {
        this.formData.currentTeamData = [];
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  onApprove(event: any) {
    if (event.status === 'close') {
      this.confirmDialoge.status = false;
    } else if (event.status === 'yes') {
      this.confirmDialoge.status = false;
      if (event.objeToRetrieve.cardDragDrop) {
        const obj = event.objeToRetrieve.dropEvent.previousContainer.data[event.objeToRetrieve.dropEvent.previousIndex];
        this.mainLoader(true);
        this.approveSubscription = this.workflowViewService.approveUser(obj, this.formData.onApproveEmailBody).subscribe((data: any) => {
          this.mainLoader(false);
          if (data) {
            transferArrayItem(event.objeToRetrieve.dropEvent.previousContainer.data,
              event.objeToRetrieve.dropEvent.container.data,
              event.objeToRetrieve.dropEvent.previousIndex,
              event.objeToRetrieve.dropEvent.currentIndex);
            this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
          }
        },
          err => {
            this.commonService.showErrorToaster(customMessages.errorMessage);
            this.mainLoader(false);
          });
      }
    }
  }

  onMoveBackToMyBucket(event: any) {
    const obj = event.previousContainer.data[event.previousIndex];
    this.mainLoader(true), this.moveBackToMyBucketSubscription = this.workflowViewService.moveToByBucket(obj).subscribe((data: any) => {
      this.mainLoader(false);
      if (data) {
        transferArrayItem(event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex);
        this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
      }
    },
      err => {
        this.commonService.showErrorToaster(customMessages.errorMessage);
        this.mainLoader(false);
      });
  }

  onRejectOrPartnerCandidateMove(event: any) {
    if (event.status === 'close') {
      this.moveBackDialouge.status = false;
    } else if (event.status === 'pause') {
      this.moveBackDialouge.status = true;
    } else if (event.status === 'move') {
      this.moveBackDialouge.status = false;
      if (event.objeToRetrieve.cardMoveBackDragDrop) {
        const obj = event.objeToRetrieve.dropEvent.previousContainer.data[event.objeToRetrieve.dropEvent.previousIndex];
        this.mainLoader(true), this.rejectSubscription = this.workflowViewService.rejectUser(obj, event.errorMessageForMovingback).subscribe((data: any) => {
          this.mainLoader(false);
          if (data) {
            transferArrayItem(event.objeToRetrieve.dropEvent.previousContainer.data,
              event.objeToRetrieve.dropEvent.container.data,
              event.objeToRetrieve.dropEvent.previousIndex,
              event.objeToRetrieve.dropEvent.currentIndex);
            this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
          }
        },
          err => {
            this.commonService.showErrorToaster(customMessages.errorMessage);
            this.mainLoader(false);
          });
      } else if (event.objeToRetrieve.cardMoveBackToPartnerCandidate) {
        const obj = event.objeToRetrieve.dropEvent.previousContainer.data[event.objeToRetrieve.dropEvent.previousIndex];
        this.mainLoader(true), this.requestMoreInfoSubscription = this.workflowViewService.requestForMoreInfo(obj, event.errorMessageForMovingback).subscribe((data: any) => {
          this.mainLoader(false);
          if (data) {
            transferArrayItem(event.objeToRetrieve.dropEvent.previousContainer.data,
              event.objeToRetrieve.dropEvent.container.data,
              event.objeToRetrieve.dropEvent.previousIndex,
              event.objeToRetrieve.dropEvent.currentIndex);
            this.commonService.showSuccessToaster(customMessages.partnerSearch.updatePartner);
          }
        },
          err => {
            this.commonService.showErrorToaster(customMessages.errorMessage);
            this.mainLoader(false);
          });
      }
    }
  }

  ngOnDestroy() {
    this.commonService.hideToaster();
    this.paeLoadJSONDataSubscription && this.paeLoadJSONDataSubscription.unsubscribe();
    this.userRoleSubscription && this.userRoleSubscription.unsubscribe();
    this.partnerDataSubscription && this.partnerDataSubscription.unsubscribe();
    this.approveSubscription && this.approveSubscription.unsubscribe();
    this.rejectSubscription && this.rejectSubscription.unsubscribe();
    this.requestMoreInfoSubscription && this.requestMoreInfoSubscription.unsubscribe();
    this.moveBackToMyBucketSubscription && this.moveBackToMyBucketSubscription.unsubscribe();
  }
}
