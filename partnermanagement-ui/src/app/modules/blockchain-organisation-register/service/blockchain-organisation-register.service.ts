import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DefaultService } from 'partnermanagement-api';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class BlockchainOrganisationRegisterService {

  constructor(private pmService: DefaultService) { }

  bindFormValues(blockchainData: any, formGroupBlockChain: FormGroup): FormGroup {
    formGroupBlockChain.controls.partnerName.setValue(blockchainData.partnerName);
    formGroupBlockChain.controls.orgName.setValue(blockchainData.organisationName);
    formGroupBlockChain.controls.orgPrefix.setValue(blockchainData.organisationPrefix);
    formGroupBlockChain.controls.domain.setValue(blockchainData.domain);
    blockchainData.types.forEach(type => {
      const typeAfterLowercase = type.toLowerCase();
      formGroupBlockChain.controls[typeAfterLowercase].setValue(true);
    });
    formGroupBlockChain.controls.amountThreshold.setValue(blockchainData.amountThreshold);
    formGroupBlockChain.controls.durationThreshold.setValue(blockchainData.durationThreshold);
    return formGroupBlockChain;
  }

  registerOrganisation(formGroupBlockChain: any, partnerID: number): Observable<any> {
    const arrTypes = [];
    if (formGroupBlockChain.reconciliation) {
      arrTypes.push('Reconciliation');
    } else {
      formGroupBlockChain.amountThreshold = 0;
      formGroupBlockChain.durationThreshold = 0;
    }
    if (formGroupBlockChain.fas) {
      arrTypes.push('FAS');
    }
    if (formGroupBlockChain.fraudposting) {
      arrTypes.push('FraudPosting');
    }
    const objToPost = {
      domain: formGroupBlockChain.domain,
      networkMountPoint: '',
      organisationName: formGroupBlockChain.orgName,
      organisationPrefix: formGroupBlockChain.orgPrefix,
      partnerName: formGroupBlockChain.partnerName,
      partnerId: partnerID,
      types: arrTypes,
      amountThreshold: formGroupBlockChain.amountThreshold,
      durationThreshold: formGroupBlockChain.durationThreshold
    };
    return this.pmService.registerToBlockChain(objToPost);
  }
}
