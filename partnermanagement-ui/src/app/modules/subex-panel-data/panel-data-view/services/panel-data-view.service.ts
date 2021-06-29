import { Injectable } from '@angular/core';
import { DataService } from 'src/app/common/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class PanelDataViewService {

  constructor(private dataService: DataService) { }

  bindSelectedProfileData(selectedProfile: any, profileData: any): any {
    selectedProfile.companyAbbr = profileData.companyAbbr;
    selectedProfile.companyName = profileData.companyName;
    selectedProfile.createdDate = profileData.createdDate;
    selectedProfile.fullName = profileData.fullName;
    selectedProfile.logo = profileData.logo;
    selectedProfile.originalCmpName = profileData.originalCmpName;
    selectedProfile.partnerId = profileData.partnerId;
    selectedProfile.status = profileData.status;
    return selectedProfile;
  }
}
