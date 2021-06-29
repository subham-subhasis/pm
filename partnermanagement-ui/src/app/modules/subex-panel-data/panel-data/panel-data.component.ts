import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-panel-data',
  template: `
  <div class="wrapper-element">
  <div class="cdk-overlay-container deeppurple-amber"></div>
  <element-panel-data *axLazyElement="elementUrl"></element-panel-data></div>`,
  styleUrls: ['./panel-data.component.scss']
})
export class PanelDataComponent implements OnInit {
  elementUrl = 'assets/elements/panel-data/panel-element-es2015.js';
  constructor() { }

  ngOnInit() {
  }

}
