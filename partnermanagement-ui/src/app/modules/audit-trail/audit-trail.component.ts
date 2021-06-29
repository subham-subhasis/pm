import { Component, OnInit } from '@angular/core';
import { ApplicationHttpClientService } from 'src/app/common/interceptor/application-http-client.service';
import { CommonService } from 'src/app/common/services/common.service';

@Component({
  selector: 'app-audit-trail',
  templateUrl: './audit-trail.component.html',
  styleUrls: ['./audit-trail.component.scss']
})
export class AuditTrailComponent implements OnInit {

  elementUrl = 'assets/elements/audit-trail/ngp-audit-trail-es2015.js';
  userid: number;
  username: string;
  readyToLoad = false;
  constructor(private appHttpService: ApplicationHttpClientService,
    private commonService: CommonService) { }

  ngOnInit() {
    this.commonService.enableStyle('ngp-audit-trail-styles.css');
    this.commonService.disableStyle('elementstyles.css');
    setTimeout(() => {
      this.userid = this.appHttpService.userId;
      this.username = this.appHttpService.userName;
      this.readyToLoad = true;
    });
  }

  ngOnDestroy() {
    this.commonService.disableStyle('ngp-audit-trail-styles.css');
    this.commonService.enableStyle('elementstyles.css');
  }

}
