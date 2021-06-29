import { Component, OnInit, Output, ViewEncapsulation, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
@Component({
  selector: 'app-common-modal',
  templateUrl: './common-modal.component.html',
  styleUrls: ['./common-modal.component.scss']
})
export class CommonModalComponent implements OnInit {

  moveBehindCommnet = '';
  errorMessageFlag = false;
  @Input() header: string;
  @Input() objToFetch: any;
  @Output() fireMoveBackModalEvent = new EventEmitter();
  constructor() { }

  ngOnInit() { }

  fireEventOnBack(parameter: string) {
    if (parameter === 'close') {
      let message = {} as any;
      message = {
        status : 'close',
        objeToRetrieve: this.objToFetch
      };
      this.fireMoveBackModalEvent.emit(message);
    } else if (parameter === 'move') {
      let message = {} as any;
      if (this.moveBehindCommnet && this.moveBehindCommnet.length > 0) {
        message = {
          status : 'move',
          objeToRetrieve: this.objToFetch,
          errorMessageForMovingback: this.moveBehindCommnet
        };
      } else {
        this.errorMessageFlag = true;
        message = {
          status : 'pause',
          objeToRetrieve: this.objToFetch
        };
      }
      this.fireMoveBackModalEvent.emit(message);
    }
  }

}
