import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchResultsViewService {

  private partnersCount = 0;

  constructor(private httpclient: HttpClient) { }

  fetchkpiAliasName() {
    return this.httpclient.get('assets/json/constantsForConfigure.json');
  }

  get getPartnersCount() {
    return this.partnersCount;
  }

  getPartnersList(listSourceData: any): any {
    this.partnersCount = 0;
    if (listSourceData && Object.keys(listSourceData).length) {
      for (const key in listSourceData) {
        if (listSourceData.hasOwnProperty(key)) {
          const element = listSourceData[key];
          this.partnersCount += element.profiles.length;
          if (element.profiles && element.profiles.length) {
            element.profiles.forEach(item => {
              if (item.isExactMatch) {
                item.isSelected = true;
                item.isExactMatch = true;
              } else {
                item.isSelected = false;
                item.isExactMatch = false;
              }
              item.isDisabled = false;
            });
          }
        }
      }
    }
    return listSourceData;
  }
}
