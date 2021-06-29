import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PanelDataViewService } from './services/panel-data-view.service';
import { CommonService } from 'src/app/common/services/common.service';

@Component({
  selector: 'app-panel-data-view',
  templateUrl: './panel-data-view.component.html',
  styleUrls: ['./panel-data-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PanelDataViewComponent implements OnInit, OnDestroy {

  loader = false;
  pageloader = false;
  selectedProfile = {} as any;
  panelDataContent = [];
  showLinkButton = false;
  constructor(public dialogRef: MatDialogRef<PanelDataViewComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any,
              private panelDataViewSerice: PanelDataViewService,
              private commonService: CommonService) { }

  ngOnInit() {
    this.mainLoader(true);
    this.getProspectProfileData(this.data.selectedProfileForPanelData.panelDataContent);
    this.showLinkButton = this.data.showLinkButton;
    this.selectedProfile = this.panelDataViewSerice.bindSelectedProfileData(this.selectedProfile, this.data.selectedProfileForPanelData);
  }

  getProspectProfileData(panelData: any) {
    if (panelData) {
      this.panelDataContent = this.formatPanelData(panelData);
    }
  }

  formatPanelData(panelDataContent: any[]): any[] {
    if (panelDataContent && panelDataContent.length > 0) {
      const allSourceData = [];
      panelDataContent.forEach(element => {
        if (allSourceData.length === 0) {
          allSourceData.push(...element.profiles[0].definitions);
        } else {
          allSourceData.push(...element.profiles[0].definitions);
        }
      });
      const retArr = allSourceData.map((kpi: any, i: any) => {
        //if (kpi && kpi.value && kpi.value.length > 0 || (kpi.value.length > 0 && kpi.value[0].length > 0)) {
          return {
            ...kpi,
            ['cols']: this.colspanCols(kpi.kpi_name),
            ['rows']: this.colspanRows(kpi.kpi_name),
            ['label']: this.configureAliasName(kpi.kpi_name),
            ['value']: this.formatValue(kpi.Values[0])
        };
        // } else {
        //   panelDataContent.splice(i, 1);
        // }
      });
      return retArr;
    } else {
      return [];
    }
  }

  formatValue(kpiValue: any): string {
    if (kpiValue === null) {
      return '-';
    } else if (kpiValue && kpiValue.length && kpiValue[0] === '{' && kpiValue[kpiValue.length - 1] === '}') {
      kpiValue = kpiValue.substr(1, kpiValue.length - 2);
      if (kpiValue === '' || kpiValue === '""') {
        return '-';
      }
      return kpiValue;
    } else  {
      return kpiValue;
    }
  }

  configureAliasName(kpiname: any) {
    return kpiname.replace(/_/g, ' ');
  }

  colspanRows(kpiName: any): number {
    let count = 1;
    if (kpiName && kpiName.toLowerCase().includes('description')) {
      count = 1;
    }
    return count;
  }

  colspanCols(kpiName: any): number {
    let count = 1;
    if (kpiName && kpiName.toLowerCase().includes('description') || kpiName.toLowerCase().includes('faq') || kpiName.toLowerCase().includes('industry') || kpiName.toLowerCase().includes('type of business')) {
      count = 3;
    }
    return count;
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

  onBackClick() {
    this.dialogRef.close({
      data: {
        onBackButtonClick : true,
        onlinkProfileClick: false
      }
    });
  }

  linkProfile() {
    this.dialogRef.close({
      data: {
        onBackButtonClick : false,
        onlinkProfileClick: true,
        allsourcesData: this.panelDataContent
      }
    });
  }

  ngOnDestroy(): void {
  }

}
