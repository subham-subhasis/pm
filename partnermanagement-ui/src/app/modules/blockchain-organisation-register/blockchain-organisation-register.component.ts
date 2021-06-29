import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BlockchainOrganisationRegisterService } from './service/blockchain-organisation-register.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonService } from 'src/app/common/services/common.service';
import { customMessages } from 'src/app/common/utility/constants';
import { CopyContentService } from '../shared/shared-services/copy-content.service';

@Component({
  selector: 'app-blockchain-organisation-register',
  templateUrl: './blockchain-organisation-register.component.html',
  styleUrls: ['./blockchain-organisation-register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BlockchainOrganisationRegisterComponent implements OnInit, OnDestroy {
  loader = false;
  formGroupBlockChain: FormGroup;
  formData: any = { saveSuccessful: false, enableEdit: false, enableSubmit: false, type: '', partnerName: '', partnerId: 0, min: 0, max: 100, step: 0.1, viewReconSliders: false, networkMountPoint: '', backUpFormGroupBlockchain: {} };
  registerOrganisationSubscription: Subscription;
  constructor(private formBuilder: FormBuilder,
              public dialogRef: MatDialogRef<BlockchainOrganisationRegisterComponent>,
              @Inject(MAT_DIALOG_DATA) private dailogData: any,
              private blockchainOrganisationRegisterService: BlockchainOrganisationRegisterService,
              private commonService: CommonService,
              private copyTextService: CopyContentService) { }

  ngOnInit() {
    console.log(this.formData.partnerName);
    this.formData.partnerName = this.dailogData.partnerName;
    this.formData.partnerId = this.dailogData.partnerId;
    this.formData.type = this.dailogData.type;
    this.createForm();
    if (this.formData.type.toLowerCase() === 'update') {
      this.formData.enableSubmit = true;
      this.formData.enableEdit = true;
      this.formGroupBlockChain = this.blockchainOrganisationRegisterService.bindFormValues(this.dailogData.blockchainData, this.formGroupBlockChain);
      this.formData.backUpFormGroupBlockchain = {...this.formGroupBlockChain };
      this.formData.networkMountPoint = this.dailogData.blockchainData.networkMountPoint ? this.dailogData.blockchainData.networkMountPoint : '';
      console.log('networkMountPoint : ', this.formData.networkMountPoint);
    }
    this.openReconSliders();
  }

  progressLoader(status: boolean) {
    status ? (this.loader = status) : setTimeout(() => {
      this.loader = status;
    }, 500);
  }

  createForm() {
    this.formGroupBlockChain = this.formBuilder.group({
      orgName: [null, [Validators.required]],
      domain: [null, Validators.required],
      orgPrefix: [null, [Validators.required]],
      partnerName: [this.formData.partnerName, [Validators.required]],
      reconciliation: false,
      fas: false,
      fraudposting: false,
      amountThreshold: [0],
      durationThreshold: [0]
    });
  }

  openReconSliders() {
    this.formData.viewReconSliders = false;
    if (this.formGroupBlockChain.value.reconciliation) {
      this.formData.viewReconSliders = true;
    }
  }

  onBackClick(saveSuccessful: boolean) {
    this.dialogRef.close({ data: {saveSuccessful} });
  }

  onConfirm() {
    if (this.formGroupBlockChain.valid) {
      if (this.checkTypeEmpty(this.formGroupBlockChain)) {
        this.progressLoader(true);
        this.registerOrganisationSubscription = this.blockchainOrganisationRegisterService.registerOrganisation(this.formGroupBlockChain.value, this.formData.partnerId).subscribe((resp: any) => {
          this.progressLoader(false);
          this.formData.saveSuccessful = true;
          this.onBackClick(this.formData.saveSuccessful);
          this.commonService.showSuccessToaster(customMessages.blockchainRegistration);
        }, err => {
          this.commonService.showErrorToaster(customMessages.blockChainErrorMessage);
          this.progressLoader(false);
        });
      } else {
        this.commonService.showErrorToaster(customMessages.manadateMessageTypeForBlockchain);
      }
    } else {
      this.markFormGroupTouched(this.formGroupBlockChain);
      this.commonService.showErrorToaster(customMessages.manadateMessage);
    }
  }

  changeAmountThreshhold(amountThreshold: any) {
    if (this.formData.enableEdit ) {
      if (this.formData.backUpFormGroupBlockchain.value.amountThreshold !== amountThreshold) {
        this.formData.enableSubmit = false;
      } else {
        this.formData.enableSubmit = true;
      }
    }
  }

  changeDurationThreshhold(durationThreshold: any) {
    if (this.formData.enableEdit) {
      if (this.formData.backUpFormGroupBlockchain.value.durationThreshold !== durationThreshold) {
        this.formData.enableSubmit = false;
      } else {
        this.formData.enableSubmit = true;
      }
    }
  }

  addValue(formControlVal: string) {
    if (formControlVal.toLowerCase() === 'amountthreshold') {
      if (this.formGroupBlockChain && this.formGroupBlockChain.value.amountThreshold !== 100) {
        this.formGroupBlockChain.value.amountThreshold = Math.round((parseFloat(this.formGroupBlockChain.value.amountThreshold) + 0.1) * 10) / 10;
        this.changeAmountThreshhold(this.formGroupBlockChain.value.amountThreshold);
      }
    } else {
      if (this.formGroupBlockChain && this.formGroupBlockChain.value.durationThreshold !== 100) {
        this.formGroupBlockChain.value.durationThreshold = Math.round((parseFloat(this.formGroupBlockChain.value.durationThreshold) + 0.1) * 10) / 10;
        this.changeDurationThreshhold(this.formGroupBlockChain.value.durationThreshold);
      }
    }
  }

  removeValue(formControlVal: string) {
    if (formControlVal.toLowerCase() === 'amountthreshold') {
      if (this.formGroupBlockChain && this.formGroupBlockChain.value.amountThreshold !== 0) {
        this.formGroupBlockChain.value.amountThreshold = Math.round((parseFloat(this.formGroupBlockChain.value.amountThreshold) - 0.1) * 10) / 10;
        this.changeAmountThreshhold(this.formGroupBlockChain.value.amountThreshold);
      }
    } else {
      if (this.formGroupBlockChain && this.formGroupBlockChain.value.durationThreshold !== 0) {
        this.formGroupBlockChain.value.durationThreshold = Math.round((parseFloat(this.formGroupBlockChain.value.durationThreshold) - 0.1) * 10) / 10;
        this.changeDurationThreshhold(this.formGroupBlockChain.value.durationThreshold);
      }
    }
  }

  private checkTypeEmpty(formGroup: FormGroup): boolean {
    let checkVal = false;
    const formGroupBlockChain = formGroup.value;
    if (formGroupBlockChain.reconciliation || formGroupBlockChain.fas || formGroupBlockChain.fraudposting) {
      checkVal = true;
    }
    return checkVal;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    (Object as any).values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }

  doCopy() {
    this.copyTextService.copyText(this.formData.networkMountPoint);
  }

  ngOnDestroy(): void {
    this.formData.saveSuccessful = false;
    this.registerOrganisationSubscription && this.registerOrganisationSubscription.unsubscribe();
  }

}
