import { Injectable } from '@angular/core';
import { AlertbarService } from 'src/app/modules/shared/alertbar/service/alertbar.service';
import { API, validationPatterns } from 'src/app/common/utility/constants';
import { DataService } from './data.service';
@Injectable()
export class CommonService {

    user: any = { userName: '', userId: '' };
    jsonData = [];
    toolBarItems = [];
   
    private _accessPriviligesData: Map<string, Array<string>> = {} as any;

    set accessPriviligesData(value: any) {
      this._accessPriviligesData = value;
    }

    get accessPriviligesData() {
      return this._accessPriviligesData;
    }

    constructor(private dataService: DataService, private alertbar: AlertbarService) { }

    getConfigurationAPI(): any {
        return this.dataService.externalGet(API.getConfigureKPIJson);
    }

    setToolBatItems(data: any) {
        this.toolBarItems = data;
    }

    getToolBatItems() {
        return this.toolBarItems;
    }

    setJSONData(data: any) {
        this.jsonData = data;
    }

    getJSONData() {
        return this.jsonData;
    }

    compareDates(lessDate: any, grtrDate: any) {
        if (lessDate && grtrDate) {
            return (new Date(lessDate).getTime() - new Date(grtrDate).getTime()) > 0 ? false : true;
        }
        return true;
    }

    findFieldIndex(arr: any, id: any, key: any) {
        return arr.filter((val: any) => id === val[key]);
    }

    showSuccessToaster(msg: any) {
        this.alertbar.show('success', 'Success', msg, 4000);
    }
    showErrorToaster(msg: any) {
        this.alertbar.show('error', 'Error', msg, 4000);
    }

    showWarningToaster(msg: any) {
        this.alertbar.show('warning', 'Warning', msg, 4000);
    }

    hideToaster() {
        this.alertbar.show('none', 'NONE', '', 4000);
    }

    getConfiguration(): any {
        return this.dataService.externalGet(API.getConfiguration);
    }

    encryptData(data: any) {
        return data && data !== 'null' ? window.btoa(JSON.stringify(data)) : null;
    }

    decryptData(data: any) {
        return data && data !== 'null' ? JSON.parse(window.atob(data)) : null;
    }

    keepInSession(key: any, data: any) {
        const encData = this.encryptData(data);
        sessionStorage.setItem(key, encData);
    }

    getFromSession(key: any) {
        return this.decryptData(sessionStorage.getItem(key));
    }

    removeFromSession(key: any) {
        sessionStorage.removeItem(key);
    }

    keepInLocal(key: any, data: any) {
        const encData = this.encryptData(data);
        localStorage.setItem(key, encData);
    }

    getFromLocal(key) {
        return this.decryptData(localStorage.getItem(key));
    }

    removeFromLocal(key) {
        localStorage.removeItem(key);
    }

    getNumberFromString(value: string) {
        if (value) {
            const data = value.match(validationPatterns.extractNumber);
            return data ? parseFloat(data[0]) : null;
        }
        return null;
    }

    isNumber(value: any) {
        return value ? !isNaN(value) : false;
    }

    generateDynamicUrl(href: string) {
        let path = '';
        // tslint:disable-next-line: variable-name
        const split_one = href.split(':');
        const split2 = split_one[split_one.length - 1].split('/');
        if (split2.length > 0) {
            path = split2[1];
        }
        return path;
    }

    paginateRecords(items: any[], currentPage: number, perPageCount: number) {
        currentPage = currentPage || 1;
        perPageCount = perPageCount || 10;
        const offset = (currentPage - 1) * perPageCount;
        const paginatedItems = items.slice(offset).slice(0, perPageCount);
        const totalPage = Math.ceil(items.length / perPageCount);
        return { page: currentPage, perPage: perPageCount, prePage: currentPage - 1 ? currentPage - 1 : null, nextPage: (totalPage > currentPage) ? currentPage + 1 : null, total: items.length, totalPages: totalPage, data: paginatedItems };
    }

    dataURLtoFile(dataUrl: string, fileName: string) {
        const arr = dataUrl.split(','); const mime = arr[0].match(/:(.*?);/)[1]; const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], fileName, { type: mime });
    }

    dataURItoBlob(dataURI: any) {
        const BASE64_MARKER = ';base64,';
        const base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
        const base64 = dataURI.substring(base64Index);
        const byteString = window.atob(base64);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'image/jpeg' });
        return blob;
    }

    convertToPdfBlobUrl(data: any) {
        const binary = atob(data.replace(/\s/g, ''));
        const buffer = new ArrayBuffer(binary.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binary.length; i++) {
            view[i] = binary.charCodeAt(i);
        }
        return URL.createObjectURL(new Blob([view], { type: 'application/pdf' }));
    }

    base64MimeType(encoded: any) {
        let result = '';
        if (typeof encoded !== 'string') {
            return result;
        }
        const mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
        if (mime && mime.length) {
            let mimetype = '';
            mimetype = mime[1];
            if (mimetype && mimetype.length) {
                const type = mimetype.split('/');
                type ? result = type[1] : result = '';
            }
        }
        return result;
    }

    getScreenActions(screenName: string){
        const actionObj = {};
        if(this._accessPriviligesData.has(screenName)){
          const screenActions = this._accessPriviligesData.get(screenName);
          screenActions.forEach(element => {
            actionObj[element.toLowerCase()] = true;
          });
        }
        return actionObj;
    }

    disableStyle(styleName) {
        const styles = document.styleSheets;
        let href = [];
        for (let i = 0; i < styles.length; i++) {
          if (!styles[i].href) {
            continue;
          }
          href = styles[i].href.split("/");
          href = href[href.length - 1];
          if (href === styleName) {
            styles[i].disabled = true;
            break;
          }
        }
      }
    
      enableStyle(styleName) {
        const styles = document.styleSheets;
        let href = [];
        for (let i = 0; i < styles.length; i++) {
          if (!styles[i].href) {
            continue;
          }
          href = styles[i].href.split("/");
          href = href[href.length - 1];
          if (href === styleName) {
            styles[i].disabled = false;
            break;
          }
        }
      }
    
}
