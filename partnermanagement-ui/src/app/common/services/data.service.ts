import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { notFound, customMessages } from 'src/app/common/utility/constants';
import { AlertbarService } from 'src/app/modules/shared/alertbar/service/alertbar.service';

@Injectable()
export class DataService {
    baseUrl: string;

    constructor(private http: HttpClient, private alertbar: AlertbarService) {
    }

    externalGet(url: string): Observable<any> {
        return this.http.get(url).pipe(catchError(err => of(err.status === notFound ? this.alertbar.show('error', 'Error',  customMessages.errorMessage404, 4000) : console.log('............Error in fetchning data from external source............'))));
    }

    getAll(url: string): Observable<any> {
        return this.http.get(url).pipe(catchError(err => of(err.status === notFound ? this.alertbar.show('error', 'Error', customMessages.errorMessage404, 4000) : console.log('............Error in fetchning data from external source............'))));
    }

    postData(url: string, data: any, headers: HttpHeaders): Observable<any> {
        const options = { headers };
        return this.http.post(url, data, options).pipe(catchError(err => of(err.status === notFound ? this.alertbar.show('error', 'Error', customMessages.errorMessage404, 4000) : console.log('............Error in fetchning data from external source............'))));
    }
}
