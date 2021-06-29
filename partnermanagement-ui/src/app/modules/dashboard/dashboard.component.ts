import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiConfigService } from 'src/app/config.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  iframeURL: any;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.iframeURL = this.sanitizer.bypassSecurityTrustResourceUrl(ApiConfigService.urlDetails.iframeUrl);
  }

}
