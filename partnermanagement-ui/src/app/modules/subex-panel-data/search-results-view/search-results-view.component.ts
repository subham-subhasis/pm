import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchResultsViewService } from './services/search-results-view.service';

@Component({
  selector: 'app-search-results-view',
  templateUrl: './search-results-view.component.html',
  styleUrls: ['./search-results-view.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchResultsViewComponent implements OnInit, OnDestroy {

  loader = false;
  pageloader = false;
  selectedProfile = {} as any;
  partnerSearchCount = 0;
  sourceData = {};
  kpiAliasmap = {};
  sourceKeys = [];
  errorMessage = { allValSelect: false };
  constructor(
    public dialogRef: MatDialogRef<SearchResultsViewComponent>,
    @Inject(MAT_DIALOG_DATA) private dailogData: any,
    private searchResultsViewService: SearchResultsViewService
  ) { }


  ngOnInit() {
    this.errorMessage.allValSelect = false;
    this.searchResultsViewService.fetchkpiAliasName().subscribe((data: any) => {
      if (data && data.length && data[0].panelData && data[0].panelData.source_alias_names) {
        this.kpiAliasmap = data[0].panelData.source_alias_names;
      }
      this.selectedProfile = this.dailogData.selectedProfileForPanelData;
      this.getSourceList(this.dailogData.listSourceData);
    });
  }

  getSourceList(listSourceData: any) {
    listSourceData = this.searchResultsViewService.getPartnersList(listSourceData);
    this.partnerSearchCount = this.searchResultsViewService.getPartnersCount;
    this.sourceData = listSourceData;
    this.sourceKeys = Object.keys(this.sourceData);
  }

  onCheck(sourceName: string, profileData: any) {
    if (this.sourceData[sourceName].profiles && this.sourceData[sourceName].profiles.length) {
      if (profileData && profileData.isSelected) {
        this.sourceData[sourceName].profiles.forEach(item => {
          if (profileData.name && item.name && profileData.name.toLowerCase() === item.name.toLowerCase()) {
            item.isDisabled = false;
          } else {
            item.isDisabled = true;
          }
        });
      } else {
        this.sourceData[sourceName].profiles.forEach(item => {
          item.isDisabled = false;
        });
      }
      const objUniqueSourceData = {} as any;
      for (const item in this.sourceData) {
        if (this.sourceData[item] && this.sourceData[item].profiles.length > 1 ) {
          const arrIsSelectedSource = this.sourceData[item].profiles.filter(data => data.isSelected === true);
          arrIsSelectedSource && arrIsSelectedSource.length > 0 && (objUniqueSourceData[item] = arrIsSelectedSource[0].name);
        } else {
          objUniqueSourceData[item] = this.sourceData[item].profiles[0].name;
        }
      }
      // if (Object.keys(objUniqueSourceData).length === Object.keys(this.sourceData).length) {
      //   this.errorMessage.allValSelect = false;
      // } else {
      //   this.errorMessage.allValSelect = true;
      // }
    }
  }

  onFetch() {
    let arrPanelDataContent = [];
    const arrsSlectedProfileForPanelData = [];
    const objUniqueSourceData = {} as any;
    // tslint:disable-next-line: forin
    for (const item in this.sourceData) {
      if (this.sourceData[item] && this.sourceData[item].profiles.length > 1 ) {
        const arrIsSelectedSource = this.sourceData[item].profiles.filter(data => data.isSelected === true);
        arrIsSelectedSource && arrIsSelectedSource.length > 0 && (objUniqueSourceData[item] = arrIsSelectedSource[0].name);
      } else {
        this.sourceData[item] && this.sourceData[item].profiles && this.sourceData[item].profiles.length > 0 && this.sourceData[item].profiles[0].isSelected && (objUniqueSourceData[item] = this.sourceData[item].profiles[0].name);
      }
    }
    // if (Object.keys(objUniqueSourceData).length === Object.keys(this.sourceData).length) {
    //   this.errorMessage.allValSelect = false;
    // } else {
    //   this.errorMessage.allValSelect = true;
    // }
    if (!this.errorMessage.allValSelect) {
      if (this.dailogData.selectedProfileForPanelData && this.dailogData.selectedProfileForPanelData.panelDataContent) {
        arrPanelDataContent = this.dailogData.selectedProfileForPanelData.panelDataContent;
        for (let k = 0; k < arrPanelDataContent.length; k++) {
          const tempObj = {} as any;
          const profilesArr = this.onlySelectedProfile(arrPanelDataContent[k].source, arrPanelDataContent[k].profiles, objUniqueSourceData)
          if (profilesArr && profilesArr.length > 0 &&  profilesArr[0].definitions.length > 0) {
            tempObj.isExactMatch = arrPanelDataContent[k].isExactMatch;
            tempObj.profiles = profilesArr;
            tempObj.source = arrPanelDataContent[k].source;
            arrsSlectedProfileForPanelData.push(tempObj);
            continue;
          }
        }
      }
      this.dialogRef.close({ data: { fetchProfile: true, arrsSlectedProfileForPanelData} });
    }
  }

  onlySelectedProfile(sourceName: string, profiles: any, objUniqueSourceData: any): any [] {
    const retArrProfile = [];
    for (let j = 0; j < profiles.length; j++ ) {
      if (objUniqueSourceData[sourceName] && profiles[j].name && 
        objUniqueSourceData[sourceName].toLowerCase() === profiles[j].name.toLowerCase()) {
          retArrProfile.push(profiles[j]);
          return retArrProfile;
      }
    }
  }

  onBackClick() {
    this.dialogRef.close({ data: {} });
  }

  ngOnDestroy(): void {
  }

}
