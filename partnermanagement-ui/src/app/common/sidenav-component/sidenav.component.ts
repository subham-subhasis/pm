import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { maticon } from 'src/app/common/utility/constants';
import { CommonService } from '../services/common.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: 'sidenav.component.html',
  styleUrls: ['sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  constructor(private router: Router, private commonService: CommonService) {
  }
  static check = false;
  formData: any = { selectedImage: 'dashboard' };
  sidenavWidth = 4;
  ngStyle: string;
  maticon: any;
  jsonData = { panelDataView : false} as any;
  sidenavToolbatItems = [];
  ngOnInit() {
    this.getJsonData();
    this.maticon = maticon;
    this.configureSideNav();
    this.formData.selectedImage = this.router.url.toString().substring(1);
  }

  private configureSideNav() {
    //this.sidenavToolbatItems
    const toolBarSideMenus = this.commonService.getToolBatItems();
    toolBarSideMenus.forEach(element => {
      const sideMenu = {} as any;
      sideMenu.orderNum = element.tolBarOrderNum;
      sideMenu.menuName = element.toolBarName;
      sideMenu.routingPathName =  element.toolBarName.replace(/ +/g, '').toLowerCase();
      sideMenu.imageUrl = './assets/images/' +'' + sideMenu.routingPathName + '.svg';
      this.sidenavToolbatItems.push(sideMenu);
    });
    console.log(this.sidenavToolbatItems);
  }

  increase() {
    SidenavComponent.check = true;
    this.sidenavWidth = 20;
  }

  decrease() {
    SidenavComponent.check = false;
    this.sidenavWidth = 4;
  }

  toggle() {
    SidenavComponent.check ? this.decrease() : this.increase();
  }

  onDirectoryClick(url: any) {
    this.formData.selectedImage = url;
    this.router.navigate([url]);
  }

  getJsonData() {
    this.jsonData.panelDataView = this.commonService.getJSONData()[0].isPanelDataIntegration;
  }
}
