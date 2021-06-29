import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WorkflowViewComponent } from './workflow-view/workflow-view.component';
import { PartnerDetailsViewComponent } from './partner-details-view/partner-details-view.component';

const workflowRoutes: Routes = [
    { path: '', component: WorkflowViewComponent},
    { path: 'partnerdetails', component: PartnerDetailsViewComponent }
];

@NgModule({
    imports: [RouterModule.forChild(workflowRoutes)],
    exports: [RouterModule]
})
export class WorkflowRoutingModule { }
