import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkflowRoutingModule } from './workflow-routing.module';
import { WorkflowViewComponent } from './workflow-view/workflow-view.component';
import { PartnerDetailsViewComponent } from './partner-details-view/partner-details-view.component';
import { SharedModule } from '../shared/shared.module';
import { OrderByPipeWorkflow, SearchFilterWorkflow } from './pipe/workflow.pipe';
import { CommonModalComponent } from './common-modal/common-modal.component';

@NgModule({
  declarations: [ WorkflowViewComponent,
    PartnerDetailsViewComponent,
    OrderByPipeWorkflow,
    SearchFilterWorkflow,
    CommonModalComponent
   ],
  imports: [
    CommonModule,
    WorkflowRoutingModule,
    SharedModule,
    FormsModule
  ],
  exports: [ SharedModule ]
})
export class WorkflowModule { }
