import { Component, OnInit } from '@angular/core';
import { ApplicationHttpClientService } from 'src/app/common/interceptor/application-http-client.service';
import { CommonService } from 'src/app/common/services/common.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  elementUrl = 'assets/elements/onBoarding/custom-element-es2015.js';
  userid: number;
  username: string;
  screenActions = {};
  constructor(private appHttpService: ApplicationHttpClientService,
              private commonService: CommonService) { }

  ngOnInit() {
    this.userid = this.appHttpService.userId;
    this.username = this.appHttpService.userName;
    this.screenActions = this.commonService.getScreenActions('Registration');
  }

}
