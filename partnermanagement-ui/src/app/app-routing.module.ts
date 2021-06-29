import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationComponent } from './modules/configuration/configuration.component';
import { RegistrationComponent } from './modules/registration/registration.component';
import { PartnerSearchComponent } from './modules/partner-search/component/partner-search.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { PanelDataComponent } from './modules/subex-panel-data/panel-data/panel-data.component';
import { AuditTrailComponent } from './modules/audit-trail/audit-trail.component';
const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'kpiconfiguration', component: ConfigurationComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'partnersearch', component: PartnerSearchComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'panelData', component: PanelDataComponent },
  { path: 'auditlog', component: AuditTrailComponent },
  {
    path: 'workflow', loadChildren: () =>
      import('./modules/workflow/workflow.module').then(
        d => d.WorkflowModule
      )
  },
  { path: '**', redirectTo: 'dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
