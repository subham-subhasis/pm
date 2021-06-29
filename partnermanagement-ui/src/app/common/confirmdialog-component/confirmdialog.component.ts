import { Component, OnInit, Output, ViewEncapsulation, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirmdialog',
  templateUrl: './confirmdialog.component.html',
  styleUrls: ['./confirmdialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ConfirmdialogComponent implements OnInit {

  @Input() message: string;
  @Input() objToFetch: any;
  @Input() buttonName: string;
  @Output() fireModalEvent = new EventEmitter();
  constructor() { }

  ngOnInit() { }

  fireEvent(parameter: string) {
    let message = {} as any;
    if (parameter === 'close') {
      message = {
        status : 'close',
        objeToRetrieve: this.objToFetch
      };
      this.fireModalEvent.emit(message);
    } else if (parameter === 'yes') {
      message = {
        status : 'yes',
        objeToRetrieve: this.objToFetch
      };
      this.fireModalEvent.emit(message);
    } else if (parameter === 'logout') {
      message = {
        status : 'logout',
        objeToRetrieve: this.objToFetch
      };
      this.fireModalEvent.emit(message);
    }
  }

}
