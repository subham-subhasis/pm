import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonService } from '../app/common/services/common.service';
import { AppService } from './app.service';
import { ApplicationHttpClientService } from './common/interceptor/application-http-client.service';
import { SessionInfo } from './common/interceptor/SessionInfo';
import { ApiConfigService } from './config.service';
import { UserIdleService } from 'angular-user-idle';
import { environment } from 'src/environments/environment';
 //
 export var usrId;
 export var decimalPrecision;
 export var userTimeFormat;
 export var userDateFormat;
 export var recieved_json;
 export var userName;
 export let SESSION_INFO: SessionInfo;
 export var loginTimer;
 //
const THEME_DARKNESS_SUFFIX = `-dark`;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit, OnDestroy {
  mainView = true;
  pageloader = false;
  title = 'PartnerManagement';
  isThemeDark = false;
  activeTheme: string;
  @HostBinding('class') activeThemeCssClass: string;
  getJsonDataSubscription: Subscription;
  getLoggedIndataSubscription: Subscription;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches)
  );

  //
  error: boolean = false;
  timer: any;
  usrName: string;
  isIdle: boolean = false;
  //
  constructor(
    private commonService: CommonService,
    private breakpointObserver: BreakpointObserver,
    private overlayContainer: OverlayContainer,
    private cdr: ChangeDetectorRef,
    private appService: AppService,
    private appConfigService: ApiConfigService,
    private applicationHttpClient: ApplicationHttpClientService,
    private userIdle: UserIdleService) {
      this.setActiveTheme('deeppurple-amber', false);
  }

  ngOnInit() {
    this.appService.setTitle(this.title);
    this.getJsonData();
  }

  mainLoader(status: boolean) {
    status ? (this.pageloader = status) : setTimeout(() => {
      this.pageloader = status;
    }, 500);
  }

  showMaster() {
    setTimeout(() => {
      this.mainView = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  toggleDarkness() {
    this.setActiveTheme(this.activeTheme, !this.isThemeDark);
  }

  setActiveTheme(theme: string, darkness: boolean = null) {
    if (darkness === null) {
      darkness = this.isThemeDark;
    } else if (this.isThemeDark === darkness) {
      if (this.activeTheme === theme) { return; }
    } else {
      this.isThemeDark = darkness;
    }
    this.activeTheme = theme;
    const cssClass = darkness === true ? theme + THEME_DARKNESS_SUFFIX : theme;
    const classList = this.overlayContainer.getContainerElement().classList;
    if (classList.contains(this.activeThemeCssClass)) {
      classList.replace(this.activeThemeCssClass, cssClass);
    } else {
      classList.add(cssClass);
    }
    this.activeThemeCssClass = cssClass;
  }

  fetchTokenAndLogin(recievedData: any) {
    if (!this.appConfigService.tokenProperties["standaloneMode"]) {
      try {
        SESSION_INFO = new SessionInfo();
        SESSION_INFO.userId = recievedData.id;
        const encryptedUserId =  this.commonService.encryptData(recievedData.id);
        const encryptedUserName = this.commonService.encryptData(recievedData.displayString);
        sessionStorage.setItem('sessionUserData',encryptedUserId);
        sessionStorage.setItem('sessionUserName',encryptedUserName);
        SESSION_INFO.productIdentifier = this.appConfigService.tokenProperties["productIdentifier"];
        this.applicationHttpClient.validateParentSession(SESSION_INFO).subscribe(
            data => {
               if (data) {
                this.getToolBarItems();
               }
            });
      } catch (err) {
        window.parent.alert("Authentication Error.Closing the window");
        this.error = true;
        //window.parent.close();
        this.appService.logout();
        throw err;
      }
      let idleTime = loginTimer/1000;
      this.userIdle.setConfigValues({idle: 1, timeout: 5, ping: 30})
      this.userIdle.startWatching();
      this.userIdle.onTimerStart().subscribe(count => void(0));
      //loading application now
      this.userIdle.onTimeout().subscribe(() =>{
        this.userIdle.resetTimer();
        this.isIdle = true;
        this.applicationHttpClient.checkServer().subscribe((data: any)=> { 
          if( data.status !== 'Success') {
            window.parent.alert("Session Expired. Closing the window");
            this.appService.logout();
            //window.parent.close();
          }
        },
          error =>{ 
            console.log(error);
              window.parent.alert("Session Expired. Closing the window");
              this.appService.logout();
              //window.parent.close();
            });
      }
      );
    }
  }

  getToolBarItems() {
    this.appService.getToolBarItems().subscribe((data: any)=> {
      this.commonService.setToolBatItems(data);
      this.showMaster();
      this.setAccessPriviligesData(data);
    },
    error =>{ 
      console.log(error);
    });
  }

  setAccessPriviligesData(toolBarData) {
    const screenActionMap: Map<string, Array<string>> = new Map();
    toolBarData.forEach(element => {
      if (element.toolBarItems && element.toolBarItems.length) {
        element.toolBarItems.forEach(item => {
          if (!screenActionMap.has(item.toolBarItemName)) {
            screenActionMap.set(item.toolBarItemName, item.actions);
          }
        });
      }
    });
    this.commonService.accessPriviligesData = screenActionMap;
  }

  getUserDetails(): void {
    this.getLoggedIndataSubscription = this.appService.getLoggedInUserDetails().subscribe(
      (data: any) => {
        if(data && data.displayString != null) {
          this.applicationHttpClient.userId = data['id'];
          this.applicationHttpClient.userName = data['displayString'];
          console.log('-----LogggedIn Successful for-----', data.displayString);
          this.fetchTokenAndLogin(data);
          //this.showMaster(); //commnet this for prod & uncommnet the above method this.fetchTokenAndLogin(data);
        } else{
          console.log('-----API getUserDetails results in NUll return response-----');
          this.appService.logout();// you can switch as well
        }
      }, err => {
        console.log('-----Failed to fetch USER related details-----');
        this.appService.logout();
      }
    );
  }

  getJsonData() {
    this.getJsonDataSubscription = this.commonService.getConfigurationAPI().subscribe((data: any) => {
      if (data) {
        this.commonService.setJSONData(data);
        this.getUserDetails();
      }
    },
      err => {
        console.log('-----Failed to fetch JSON details-----');
        this.appService.logout();
      });
  }

  ngOnDestroy(): void {
    this.getJsonDataSubscription && this.getJsonDataSubscription.unsubscribe();
    this.getLoggedIndataSubscription && this.getLoggedIndataSubscription.unsubscribe();
  }
}