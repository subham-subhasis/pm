import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchFilter } from './filter.pipe';
import { DynamicFormModule } from 'dynamic-form';
import { MaterialModule } from 'src/material-module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmdialogComponent } from 'src/app/common/confirmdialog-component/confirmdialog.component';
import { CommonService } from 'src/app/common/services/common.service';
import { AlertbarComponent } from './alertbar/alertbar.component';
import { AlertbarService } from './alertbar/service/alertbar.service';
import { CopyContentService } from './shared-services/copy-content.service';
import { InfiniteScrollModule } from 'src/app/common/infinite-scroll/ngx-infinite-scroll';


@NgModule({
  declarations: [ ConfirmdialogComponent, SearchFilter, AlertbarComponent],
  imports: [
    CommonModule,
    DynamicFormModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule
    ],
  providers: [ CommonService, AlertbarService, CopyContentService ],
  exports: [
    AlertbarComponent,
    SearchFilter,
    ConfirmdialogComponent,
    DynamicFormModule,
    MaterialModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    InfiniteScrollModule
  ]
})
export class SharedModule { }
