import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { maticon } from 'src/app/common/utility/constants';
import { AppService } from 'src/app/app.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { ApiConfigService } from 'src/app/config.service';
@Component({
  selector: 'app-header-panel',
  templateUrl: 'header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  greetings: string;
  fetchObject = {};
  maticon: any;
  userName = '';
  confirmDialog: boolean;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches)
  );
  constructor(private translate: TranslateService, private appService: AppService,
              private breakpointObserver: BreakpointObserver,
              private appConfigService: ApiConfigService) { }

  ngOnInit() {
    this.userName = this.appService.logindetails && this.appService.logindetails['displayString'] ? this.appService.logindetails['displayString'] : '';
    this.maticon = maticon;
    this.loadGreetings();
  }

  loadGreetings() {
    const myDate = new Date();
    const hrs = myDate.getHours();
    if (hrs < 12) {
      this.translate.get('GREETING.MORNING').subscribe((value) => {
        this.greetings = value;
      });
    } else if (hrs >= 12 && hrs < 17) {
      this.translate.get('GREETING.AFTERNOON').subscribe((value) => {
        this.greetings = value;
      });
    } else if (hrs >= 17 && hrs <= 24) {
      this.translate.get('GREETING.EVENING').subscribe((value) => {
        this.greetings = value;
      });
    }
  }

  navigate() {
    const url = this.redirect('switch');
    location.href = url;
  }

  onModalClick(event: any) {
    if (event.status === 'close') {
      this.confirmDialog = false;
    } else if (event.status === 'logout') {
      const url = this.redirect('logout');
      location.assign(url);
    }
  }

  private redirect(param: string) {
    let url = '';
    const protocol = this.appConfigService.applicationProperties['protocol'];
    if (!environment.production) {
      param === 'switch' ? url = 'http://10.113.114.126:8080/partnerportalv3/sparkLogin.jsp' :
        url = 'http://10.113.116.113:8080/partnerportalv3/sparkLogout.html';
    } else {
      const href: string = location.href;
      const path = this.appService.generateDynamicUrl(href);
      const host = location.host;
      if (param === 'switch') {
        url = protocol + '://' + host + '/' + path;
      } else if (param === 'logout') {
        url = protocol + '://' + host + '/' + path + '/sparkLogout.html';
      }
      sessionStorage.clear();
    }
    return url;
  }

  ngOnDestroy(): void {
  }
}
