import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { ApplicationHttpClientService } from './application-http-client.service';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators/switchMap';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

@Injectable({
  providedIn: 'root'
})
export class BasicAuthHttpInterceptorService implements HttpInterceptor {
  urlsToNotUse: Array<string>;
  constructor(
    private appHttpClient: ApplicationHttpClientService,
    public http: HttpClient,
    private appService: AppService) {
    this.urlsToNotUse = [
      './assets/',
      'ppservices/common/updatesessiongettoken'
    ];
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.isValidRequestForInterceptor(request.url)) {
      const { url, params } = this.appHttpClient.getUpdateTokenURLandParams();
      if (!params.userId) {
        return next.handle(request);
      }
      return this.http.post(url, params).pipe(
        map(resp => {
          return resp['token'];
        }),
        switchMap(token => {
          if (token) {
            let headers = new HttpHeaders();
            headers = headers.append('Authorization', `Bearer ${token}`);
            headers = headers.append('Content-Type', 'application/json');
            headers = headers.append('userName', params.userName); 
            request = request.clone({ headers });
            return next.handle(request);
          } else {
            //return next.handle(request);
            throw new Error("Unable to generate token.");
            //return of({} as any);
          }
        })
      )
    }
    return next.handle(request);
  }

  private isValidRequestForInterceptor(requestUrl: string): boolean {
    if (requestUrl.startsWith('./assets/') || requestUrl.endsWith('updatesessiongettoken')
      || requestUrl.endsWith('awakeServer') || requestUrl.includes('ppservices')) {
      return false;
    }
    return true;
  }
}