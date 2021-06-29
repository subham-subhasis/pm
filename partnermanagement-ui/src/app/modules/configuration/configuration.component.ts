import { Component, OnInit } from '@angular/core';
import { ApplicationHttpClientService } from 'src/app/common/interceptor/application-http-client.service';
import { CommonService } from 'src/app/common/services/common.service';

@Component({
  selector: 'app-element-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.scss']
})
export class ConfigurationComponent implements OnInit {
  elementUrl = 'assets/elements/onBoarding/custom-element-es2015.js';
  userid: number;
  username: string;
  screenActions = {};
  readyToLoad = false;
  constructor(private appHttpService: ApplicationHttpClientService,
    private commonService: CommonService) { }

  ngOnInit() {
    setTimeout(() => {
      this.userid = this.appHttpService.userId;
      this.username = this.appHttpService.userName;
      console.log(this.username, this.userid);
      this.screenActions = this.commonService.getScreenActions('KPI Configuration');
      console.log('--------------------------------', this.screenActions);
      sessionStorage.setItem('configurationScreenActions',JSON.stringify(this.screenActions));
      this.readyToLoad = true;
    });
  }
}
